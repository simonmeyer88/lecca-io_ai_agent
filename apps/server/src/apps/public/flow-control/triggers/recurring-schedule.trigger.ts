import { BadRequestException } from '@nestjs/common';
import { DateTime } from 'luxon';
import { Options, RRule } from 'rrule';
import { z } from 'zod';

import { RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { NodeViewOptions, Trigger, TriggerStrategy } from '@/apps/lib/trigger';
import { parseDateToISO } from '@/apps/utils/parse-date-to-iso';
import { ServerConfig } from '@/config/server.config';

import { FlowControl } from '../flow-control.app';

export class RecurringSchedule extends Trigger {
  app: FlowControl;
  id = 'flow-control_trigger_recurring-schedule';
  needsConnection = false;
  name = 'Recurring Schedule';
  iconUrl: null | string =
    `${ServerConfig.INTEGRATION_ICON_BASE_URL}/triggers/${this.id}.svg`;
  strategy: TriggerStrategy = 'schedule';
  description = 'Schedule this trigger to run at specific times.';
  aiSchema = z.object({
    start: z.string().min(1).describe('Start date as iso string'),
    rrule: z.array(z.string().min(1).max(1).describe('An RRULE string')),
    //NOT INCLUDING THE OTHER PROPERTIES, BECAUSE OUR AI AGENT CAN CREATE CUSTOM RRULEs USING THE rrule field
  });
  inputConfig: InputConfig[] = [
    {
      id: 'start',
      label: 'Start',
      hideCustomTab: true,
      description: 'When to start the recurring schedule',
      inputType: 'date-time',
      required: {
        missingMessage: 'Start is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'rrule',
      label: 'Repeats',
      hideCustomTab: true,
      description: 'Repeating frequency',
      occurenceType: 'dynamic',
      inputType: 'select',
      loadOptions: {
        dependsOn: ['start'],
        forceRefresh: true,
        hideRefreshButton: true,
      },
      _getDynamicValues: async ({ extraOptions }) => {
        const start = extraOptions?.start;

        if (!start) {
          throw new BadRequestException('Start is required');
        }

        return this.#createDropdownOptions(start);
      },
      required: {
        missingMessage: 'Repeat is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'customRepeatPeriod',
      label: 'Repeat Period',
      hideCustomTab: true,
      description: 'Custom repeat period',
      inputType: 'select',
      defaultValue: 'DAILY',
      selectOptions: [
        {
          label: 'Minutes',
          value: 'MINUTELY',
        },
        {
          label: 'Hours',
          value: 'HOURLY',
        },
        {
          label: 'Days',
          value: 'DAILY',
        },
        {
          label: 'Weeks',
          value: 'WEEKLY',
        },
        {
          label: 'Months',
          value: 'MONTHLY',
        },
      ],
      loadOptions: {
        dependsOn: [
          {
            id: 'rrule',
            value: ['custom'],
          },
        ],
      },
    },
    {
      id: 'customWeekDays',
      label: 'Repeat on',
      description: 'Week days to repeat on',
      hideCustomTab: true,
      inputType: 'multi-select',
      placeholder: 'Select week days',
      defaultValue: ['MO', 'TU', 'WE', 'TH', 'FR'],
      selectOptions: [
        {
          label: 'Monday',
          value: 'MO',
        },
        {
          label: 'Tuesday',
          value: 'TU',
        },
        {
          label: 'Wednesday',
          value: 'WE',
        },
        {
          label: 'Thursday',
          value: 'TH',
        },
        {
          label: 'Friday',
          value: 'FR',
        },
        {
          label: 'Saturday',
          value: 'SA',
        },
        {
          label: 'Sunday',
          value: 'SU',
        },
      ],
      loadOptions: {
        dependsOn: [
          {
            id: 'rrule',
            value: ['custom'],
          },
          {
            id: 'customRepeatPeriod',
            value: 'WEEKLY',
          },
        ],
      },
    },
    {
      id: 'customRepeatFrequency',
      label: 'Repeat Frequency',
      description:
        'Every how many hours, days, weeks, or months the schedule should repeat.',
      hideCustomTab: true,
      inputType: 'number',
      defaultValue: 3,
      numberOptions: {
        min: 1,
        step: 1,
      },
      loadOptions: {
        dependsOn: [
          {
            id: 'rrule',
            value: ['custom'],
          },
        ],
      },
    },
  ];
  viewOptions: NodeViewOptions = {
    saveButtonOptions: { hideSaveAndTestButton: true },
    hideConditions: true,
  };

  /**
   * This unique trigger returns the next occurrence of the recurring schedule
   */
  async run({ configValue }: RunActionArgs<ConfigValue>) {
    const now = DateTime.utc();

    const isoDate = parseDateToISO(configValue.start);

    // Convert the startDate from ISO format to a DateTime object
    const startDate = DateTime.fromISO(isoDate, { zone: 'utc' });

    let rruleString = configValue.rrule[0];
    if (rruleString === 'custom') {
      const customRepeatPeriod = configValue.customRepeatPeriod;
      const customWeekDays = configValue.customWeekDays;
      const customRepeatFrequency = configValue.customRepeatFrequency;

      if (!customRepeatPeriod) {
        throw new Error('Custom repeat period is required');
      }

      if (!customRepeatFrequency) {
        throw new Error('Custom repeat frequency is required');
      }

      const options: Partial<Options> = {
        freq: RRule[customRepeatPeriod],
        interval: customRepeatFrequency,
      };

      if (
        customRepeatPeriod === 'WEEKLY' &&
        customWeekDays &&
        customWeekDays.length > 0
      ) {
        options.byweekday = customWeekDays.map((day) => RRule[day]);
      }

      if (['DAILY', 'WEEKLY', 'MONTHLY'].includes(customRepeatPeriod)) {
        options.byhour = [startDate.hour];
        options.byminute = [startDate.minute];
      } else if (customRepeatPeriod === 'HOURLY') {
        options.byminute = [startDate.minute];
      } else if (customRepeatPeriod === 'MINUTELY') {
        // No additional options needed
      }

      const rrule = new RRule(options);
      rruleString = rrule.toString();
    }

    // Parse the recurrence rule from the provided string
    const rrule = RRule.fromString(rruleString);

    // Determine the later of the startDate or now
    const afterDate = startDate > now ? startDate : now;

    //Set afterDate seconds to 0
    afterDate.set({ second: 0 });

    // Find the next occurrence after the later of startDate or now
    const nextOccurrence = rrule.after(afterDate.toJSDate(), true);

    // Set seconds to 0
    nextOccurrence.setSeconds(0);

    // Convert the next occurrence to a DateTime object
    const nextOccurrenceDateTime = DateTime.fromJSDate(nextOccurrence).toUTC();

    return [nextOccurrenceDateTime.toISO()];
  }

  async mockRun() {
    //This isn't used for this trigger
    return [''];
  }

  /**
   * Uses RFC 5545 to generate recurrence options
   */
  #generateRecurrenceOptions(selectedDate: string) {
    const dt = DateTime.fromJSDate(new Date(selectedDate), { zone: 'utc' });

    // Extract hour and minute from the selected date
    const hour = dt.hour;
    const minute = dt.minute;

    // Calculate the occurrence (1st, 2nd, 3rd, etc.) of the selected day in the month
    const occurrence = Math.ceil(dt.day / 7);
    const weekday = dt.toFormat('EEE').toUpperCase().substring(0, 2);

    // Determine if the selected day is the last occurrence in the month
    const isLastOccurrence = this.#isLastOccurrenceOfWeekdayInMonth(dt);

    return {
      doesNotRepeat: `DTSTART:${this.#formatDate(dt)}\nDTEND:${this.#formatDate(dt.plus({ hours: 1 }))}`,
      daily: `RRULE:FREQ=DAILY;BYHOUR=${hour};BYMINUTE=${minute}`,
      weekly: `RRULE:FREQ=WEEKLY;BYDAY=${weekday};BYHOUR=${hour};BYMINUTE=${minute}`,
      monthly: `RRULE:FREQ=MONTHLY;BYDAY=${isLastOccurrence ? '-1' : occurrence}${weekday};BYHOUR=${hour};BYMINUTE=${minute}`,
      yearly: `RRULE:FREQ=YEARLY;BYMONTH=${dt.month};BYMONTHDAY=${dt.day};BYHOUR=${hour};BYMINUTE=${minute}`,
      everyWeekday: `RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR;BYHOUR=${hour};BYMINUTE=${minute}`,
      custom: 'custom', // Placeholder for custom rules
    };
  }

  #isLastOccurrenceOfWeekdayInMonth(date: DateTime<true> | DateTime<false>) {
    const lastDayOfMonth = date.endOf('month');
    let currentDay = lastDayOfMonth;

    while (currentDay.weekday !== date.weekday) {
      currentDay = currentDay.minus({ days: 1 });
    }

    return currentDay.day === date.day;
  }

  #createDropdownOptions(selectedDate: string) {
    const recurrenceOptions = this.#generateRecurrenceOptions(selectedDate);
    const dt = DateTime.fromJSDate(new Date(selectedDate), { zone: 'utc' });

    return [
      { label: 'Daily', value: recurrenceOptions.daily },
      {
        label:
          'Weekly on ' +
          DateTime.fromJSDate(new Date(selectedDate)).toFormat('cccc'),
        value: recurrenceOptions.weekly,
      },
      {
        label: `Monthly on the ${this.#getOccurrence(dt)} ${dt.toFormat('cccc')}`,
        value: recurrenceOptions.monthly,
      },
      {
        label:
          'Annually on ' +
          DateTime.fromJSDate(new Date(selectedDate)).toFormat('MMMM d'),
        value: recurrenceOptions.yearly,
      },
      {
        label: 'Every weekday (Monday to Friday)',
        value: recurrenceOptions.everyWeekday,
      },
      { label: 'Custom...', value: recurrenceOptions.custom },
    ];
  }

  #getOrdinalSuffix(n: number) {
    const s = ['th', 'st', 'nd', 'rd'],
      v = n % 100;
    return n + (s[(v - 20) % 10] || s[v] || s[0]);
  }

  #getOccurrence(date: DateTime<true> | DateTime<false>) {
    const firstDayOfMonth = date.startOf('month');
    let count = 1;
    let currentDay = firstDayOfMonth;

    while (currentDay < date) {
      if (currentDay.weekday === date.weekday && currentDay.day !== date.day) {
        count++;
      }
      currentDay = currentDay.plus({ days: 1 });
    }

    // Check if the date is the last occurrence
    // const lastDayOfMonth = date.endOf('month');
    currentDay = date;
    let nextSameWeekday = date.plus({ weeks: 1 });

    while (nextSameWeekday.month === date.month) {
      currentDay = nextSameWeekday;
      nextSameWeekday = nextSameWeekday.plus({ weeks: 1 });
    }

    if (currentDay.toFormat('yyyy-MM-dd') === date.toFormat('yyyy-MM-dd')) {
      return 'last';
    } else {
      return this.#getOrdinalSuffix(count);
    }
  }

  #formatDate(date: DateTime<true> | DateTime<false>) {
    return date.toFormat("yyyyMMdd'T'HHmmss'Z'");
  }
}

type ConfigValue = z.infer<RecurringSchedule['aiSchema']> & {
  customRepeatPeriod: 'MINUTELY' | 'HOURLY' | 'DAILY' | 'WEEKLY' | 'MONTHLY';
  customWeekDays: ('MO' | 'TU' | 'WE' | 'TH' | 'FR' | 'SA' | 'SU')[];
  customRepeatFrequency: number;
};

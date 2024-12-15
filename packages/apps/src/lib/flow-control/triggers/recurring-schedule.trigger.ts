import { createScheduleTrigger, parseDateToISO } from '@lecca-io/toolkit';
import {
  createDateTimeInputField,
  createMultiSelectInputField,
  createNumberInputField,
  createSelectInputField,
} from '@lecca-io/toolkit';
import { DateTime } from 'luxon';
import { Options, RRule } from 'rrule';

import { shared } from '../shared/flow-control.shared';

export const recurringSchedule = createScheduleTrigger({
  id: 'flow-control_trigger_recurring-schedule',
  name: 'Recurring Schedule',
  description: 'Schedule this trigger to run at specific times.',
  iconUrl: `https://lecca-io.s3.us-east-2.amazonaws.com/assets/triggers/flow-control_trigger_recurring-schedule.svg`,
  inputConfig: [
    createDateTimeInputField({
      id: 'start',
      label: 'Start',
      hideCustomTab: true,
      description: 'When to start the recurring schedule',
      required: {
        missingMessage: 'Start is required',
        missingStatus: 'warning',
      },
    }),
    {
      id: 'rrule',
      label: 'Repeats',
      hideCustomTab: true,
      inputType: 'select',
      description: 'Repeating frequency',
      occurenceType: 'dynamic',
      loadOptions: {
        dependsOn: ['start'],
        forceRefresh: true,
        hideRefreshButton: true,
      },
      _getDynamicValues: async ({ extraOptions }) => {
        const start = extraOptions?.start;

        if (!start) {
          throw new Error('Start is required');
        }

        return shared.createDropdownOptions(start);
      },
      required: {
        missingMessage: 'Repeat is required',
        missingStatus: 'warning',
      },
    },
    createSelectInputField({
      id: 'customRepeatPeriod',
      label: 'Repeat Period',
      hideCustomTab: true,
      description: 'Custom repeat period',
      defaultValue: 'DAILY',
      selectOptions: [
        { label: 'Minutes', value: 'MINUTELY' },
        { label: 'Hours', value: 'HOURLY' },
        { label: 'Days', value: 'DAILY' },
        { label: 'Weeks', value: 'WEEKLY' },
        { label: 'Months', value: 'MONTHLY' },
      ],
      loadOptions: {
        dependsOn: [
          {
            id: 'rrule',
            value: ['custom'],
          },
        ],
      },
    }),
    createMultiSelectInputField({
      id: 'customWeekDays',
      label: 'Repeat on',
      description: 'Week days to repeat on',
      hideCustomTab: true,
      placeholder: 'Select week days',
      defaultValue: ['MO', 'TU', 'WE', 'TH', 'FR'],
      selectOptions: [
        { label: 'Monday', value: 'MO' },
        { label: 'Tuesday', value: 'TU' },
        { label: 'Wednesday', value: 'WE' },
        { label: 'Thursday', value: 'TH' },
        { label: 'Friday', value: 'FR' },
        { label: 'Saturday', value: 'SA' },
        { label: 'Sunday', value: 'SU' },
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
    }),
    createNumberInputField({
      id: 'customRepeatFrequency',
      label: 'Repeat Frequency',
      description:
        'Every how many hours, days, weeks, or months the schedule should repeat.',
      hideCustomTab: true,
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
    }),
  ],
  viewOptions: {
    saveButtonOptions: { hideSaveAndTestButton: true },
    hideConditions: true,
  },
  run: async ({ configValue }) => {
    const now = DateTime.utc();
    const isoDate = parseDateToISO(configValue.start);
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
      }

      const rrule = new RRule(options);
      rruleString = rrule.toString();
    }

    const rrule = RRule.fromString(rruleString);
    const afterDate = startDate > now ? startDate : now;
    afterDate.set({ second: 0 });

    const nextOccurrence = rrule.after(afterDate.toJSDate(), true);
    nextOccurrence.setSeconds(0);

    const nextOccurrenceDateTime = DateTime.fromJSDate(nextOccurrence).toUTC();

    return [nextOccurrenceDateTime.toISO()];
  },
  mockRun: async () => [''], //this isn't used for this trigger.
});

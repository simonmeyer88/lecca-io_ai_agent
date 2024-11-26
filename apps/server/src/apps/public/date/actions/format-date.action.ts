import { DateTime } from 'luxon';
import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { NodeViewOptions } from '@/apps/lib/trigger';
import { parseDateToISO } from '@/apps/utils/parse-date-to-iso';
import { luxonTimeFormats } from '@/apps/utils/time-formats';
import { timezoneDropdown } from '@/apps/utils/timezones';
import { ServerConfig } from '@/config/server.config';

import { DateHelper } from '../date.app';

export class FormatDate extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: DateHelper;

  id() {
    return 'date_action_format-date';
  }

  name() {
    return 'Format Date';
  }

  iconUrl(): null | string {
    return `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.app.id}.svg`;
  }

  needsConnection(): boolean {
    return false;
  }

  description() {
    return 'Changes the date into a different format.';
  }

  viewOptions(): null | NodeViewOptions {
    return {
      saveButtonOptions: {
        replaceSaveAndTestButton: {
          label: 'Save & Test',
          type: 'real',
        },
      },
    };
  }

  aiSchema() {
    return z.object({
      date: z
        .string()
        .min(1)
        .describe('Time in ISO String format with timezone or UTC'),
      timeZone: z
        .string()
        .describe(
          "IANA Time Zones follows this convention: {AREA}/{LOCATION}. Ask user if you don't know the timezone",
        ),
      timeFormat: z
        .string()
        .describe('Luxon time format to use for formatting the date.'),
    });
  }

  inputConfig(): InputConfig[] {
    return [
      {
        id: 'date',
        label: 'Date',
        description:
          'Event start time in ISO String format with timezone or UTC',
        inputType: 'date-time',
        required: {
          missingMessage: 'Start DateTime is required',
          missingStatus: 'warning',
        },
      },
      {
        id: 'timeZone',
        label: 'Time Zone',
        description: 'Timezone to use for the formatted date.',
        inputType: 'dynamic-select',
        _getDynamicValues: async () => {
          return timezoneDropdown;
        },
        selectOptions: [
          {
            value: 'UTC',
            label: 'UTC',
          },
        ],
        required: {
          missingMessage: 'Time Zone is required',
          missingStatus: 'warning',
        },
        defaultValue: 'UTC',
      },
      {
        id: 'timeFormat',
        label: 'Time Format',
        description: 'Format to use for the formatted date.',
        inputType: 'dynamic-select',
        _getDynamicValues: async () => {
          return luxonTimeFormats.map((format) => ({
            value: format.value,
            label: format.label,
          }));
        },
        required: {
          missingMessage: 'Time Format is required',
          missingStatus: 'warning',
        },
      },
    ];
  }

  async run({ configValue }: RunActionArgs<ConfigValue>): Promise<Response> {
    const { date, timeFormat, timeZone } = configValue;

    const isoDate = parseDateToISO(date);

    const dt = DateTime.fromISO(isoDate, { zone: timeZone });

    return {
      date: dt.toFormat(timeFormat),
    };
  }

  async mockRun(): Promise<unknown> {
    //THERE IS NO MOCK ON THIS FUNCITON
    return [];
  }
}

type ConfigValue = z.infer<ReturnType<FormatDate['aiSchema']>>;

type Response = {
  date: string;
};

import {
  Action,
  RunActionArgs,
  ActionConstructorArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { z } from 'zod';
import { NodeViewOptions } from '@/apps/lib/trigger';
import { DateHelper } from '../date.app';
import { timezoneDropdown } from '@/apps/utils/timezones';
import { DateTime } from 'luxon';
import { ServerConfig } from '@/config/server.config';

export class GetCurrentDate extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: DateHelper;

  id() {
    return 'date_action_get-current-date';
  }

  name() {
    return 'Get Current Date';
  }

  iconUrl(): null | string {
    return `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.app.id}.svg`;
  }

  needsConnection(): boolean {
    return false;
  }

  description() {
    return 'Gets the current date using the provided timezone.';
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
      timeZone: z
        .string()
        .describe(
          "IANA Time Zones follows this convention: {AREA}/{LOCATION}. Ask user if you don't know the timezone",
        ),
    });
  }

  inputConfig(): InputConfig[] {
    return [
      {
        id: 'timeZone',
        label: 'Time Zone',
        description: 'Event time zone',
        inputType: 'dynamic-select',
        _getDynamicValues: async () => {
          return timezoneDropdown;
        },
        required: {
          missingMessage: 'Time Zone is required',
          missingStatus: 'warning',
        },
      },
    ];
  }

  async run({ configValue }: RunActionArgs<ConfigValue>): Promise<Response> {
    const timezone = configValue.timeZone;
    return { date: DateTime.now().setZone(timezone).toISO() };
  }

  async mockRun(): Promise<unknown> {
    //THERE IS NO MOCK ON THIS FUNCITON
    return [];
  }
}

type ConfigValue = z.infer<ReturnType<GetCurrentDate['aiSchema']>>;

type Response = {
  date: string;
};

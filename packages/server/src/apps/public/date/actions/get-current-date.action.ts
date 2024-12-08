import { DateTime } from 'luxon';
import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { NodeViewOptions } from '@/apps/lib/trigger';
import { timezoneDropdown } from '@/apps/utils/timezones';
import { ServerConfig } from '@/config/server.config';

import { DateHelper } from '../date.app';

export class GetCurrentDate extends Action {
  app: DateHelper;
  id = 'date_action_get-current-date';
  name = 'Get Current Date';
  iconUrl: null | string =
    `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.app.id}.svg`;
  needsConnection = false;
  description = 'Gets the current date using the provided timezone.';
  viewOptions: null | NodeViewOptions = {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
      },
    },
  };
  aiSchema = z.object({
    timeZone: z
      .string()
      .describe(
        "IANA Time Zones follows this convention: {AREA}/{LOCATION}. Ask user if you don't know the timezone",
      ),
  });
  inputConfig: InputConfig[] = [
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

  async run({ configValue }: RunActionArgs<ConfigValue>): Promise<Response> {
    const timezone = configValue.timeZone;
    return { date: DateTime.now().setZone(timezone).toISO() };
  }

  async mockRun(): Promise<unknown> {
    //THERE IS NO MOCK ON THIS FUNCITON
    return [];
  }
}

type ConfigValue = z.infer<GetCurrentDate['aiSchema']>;

type Response = {
  date: string;
};

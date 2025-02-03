import {
  createAction,
  luxonTimeFormats,
  parseDateToISO,
  timezoneDropdown,
} from '@lecca-io/toolkit';
import { DateTime } from 'luxon';
import { z } from 'zod';

export const formatDate = createAction({
  id: 'date_action_format-date',
  name: 'Format Date',
  description: 'Changes the date into a different format.',
  inputConfig: [
    {
      id: 'date',
      label: 'Date',
      description: 'Event start time in ISO String format with timezone or UTC',
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
  ],
  aiSchema: z.object({
    date: z.string().describe('Time in ISO String format with timezone or UTC'),
    timeZone: z
      .string()
      .describe(
        "IANA Time Zones follows this convention: {AREA}/{LOCATION}. Ask user if you don't know the timezone",
      ),
    timeFormat: z
      .string()
      .describe('Luxon time format to use for formatting the date.'),
  }),
  viewOptions: {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
      },
    },
  },
  run: async ({ configValue }) => {
    const { date, timeFormat, timeZone } = configValue;
    const isoDate = parseDateToISO(date);
    const dt = DateTime.fromISO(isoDate, { zone: timeZone });

    return {
      date: dt.toFormat(timeFormat),
    };
  },
  mockRun: async () => {
    //THERE IS NO MOCK ON THIS FUNCTION
    return [];
  },
});

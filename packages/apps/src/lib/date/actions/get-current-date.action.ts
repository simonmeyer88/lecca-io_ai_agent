import {
  createAction,
  createDynamicSelectInputField,
  timezoneDropdown,
} from '@lecca-io/toolkit';
import { DateTime } from 'luxon';
import { z } from 'zod';

export const getCurrentDate = createAction({
  id: 'date_action_get-current-date',
  name: 'Get Current Date',
  description: 'Gets the current date using the provided timezone.',
  inputConfig: [
    createDynamicSelectInputField({
      id: 'timeZone',
      label: 'Time Zone',
      description: 'Event time zone',
      _getDynamicValues: async () => timezoneDropdown,
      required: {
        missingMessage: 'Time Zone is required',
        missingStatus: 'warning',
      },
    }),
  ],
  aiSchema: z.object({
    timeZone: z
      .string()
      .describe(
        "IANA Time Zones follows this convention: {AREA}/{LOCATION}. Ask user if you don't know the timezone",
      ),
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
    const timezone = configValue.timeZone;
    return { date: DateTime.now().setZone(timezone).toISO() };
  },
  mockRun: async () => {
    // THERE IS NO MOCK ON THIS FUNCTION
    return [];
  },
});

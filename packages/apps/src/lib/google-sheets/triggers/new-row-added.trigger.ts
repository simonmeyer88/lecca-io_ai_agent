import { createLengthBasedPollTrigger } from '@lecca-io/toolkit';

import { shared } from '../shared/google-sheets.shared';

export const newRowAdded = createLengthBasedPollTrigger({
  id: 'google-sheets_trigger_new-row-added',
  name: 'New Row Added',
  description:
    'Triggers when a new row is added to a specified sheet in a Google Spreadsheet.',
  inputConfig: [
    shared.fields.dynamicSelectSpreadSheets,
    shared.fields.dynamicSelectSheetNames,
  ],
  run: async ({ connection, configValue }) => {
    const googleSheets = await shared.googleSheets({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { spreadsheet, sheet } = configValue;

    const response = await googleSheets.spreadsheets.values.get({
      spreadsheetId: spreadsheet,
      range: sheet,
    });

    const rows = response.data.values || [];

    return rows;
  },
  mockRun: async () => {
    return [['Row Item 1', 'Row Item 2']];
  },
});

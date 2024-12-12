import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-sheets.shared';

type Sheet = {
  id: string;
  name: string;
};

export const listSheets = createAction({
  id: 'google-sheets_action_list-sheets',
  name: 'List Sheets',
  description:
    'Lists all sheets available within a specific Google Spreadsheet.',
  inputConfig: [shared.fields.dynamicSelectSpreadSheets],
  aiSchema: z.object({
    spreadsheet: z.string().describe('Spreadsheet ID is required'),
  }),

  run: async ({ connection, configValue }): Promise<Sheet[]> => {
    const sheets = shared.googleSheets({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const response = await sheets.spreadsheets.get({
      spreadsheetId: configValue.spreadsheet,
    });

    return (
      response.data.sheets?.map((sheet) => ({
        id: sheet.properties?.sheetId?.toString(),
        name: sheet.properties?.title,
      })) ?? []
    );
  },

  mockRun: async (): Promise<Sheet[]> => {
    return [
      {
        id: '1',
        name: 'Mock Sheet 1',
      },
      {
        id: '2',
        name: 'Mock Sheet 2',
      },
    ];
  },
});

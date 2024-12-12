import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-sheets.shared';

export const deleteSheet = createAction({
  id: 'google-sheets_action_delete-sheet',
  name: 'Delete Sheet',
  description: 'Delete a sheet.',
  inputConfig: [
    {
      ...shared.fields.dynamicSelectSpreadSheets,
      description: 'Select the spreadsheet of the sheet you want to delete.',
    },
    {
      ...shared.fields.dynamicSelectSheetIds,
      description: 'Select the sheet you want to delete.',
    },
  ],
  aiSchema: z.object({
    sheet: z.string().min(1).describe('The ID of the sheet to delete'),
    spreadsheet: z
      .string()
      .min(1)
      .describe('The ID of the spreadsheet that contains the sheet'),
  }),
  run: async ({ configValue, connection }) => {
    const googleSheets = shared.googleSheets({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { sheet, spreadsheet } = configValue;

    await googleSheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheet,
      requestBody: {
        requests: [
          {
            deleteSheet: {
              sheetId: Number(sheet),
            },
          },
        ],
      },
    });

    return {
      sheetId: sheet,
      deleted: true,
    };
  },
  mockRun: async () => {
    return {
      sheetId: 'mock-sheet-id',
      deleted: true,
    };
  },
});

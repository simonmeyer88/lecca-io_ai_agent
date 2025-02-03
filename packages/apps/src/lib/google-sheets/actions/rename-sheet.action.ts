import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-sheets.shared';

export const renameSheet = createAction({
  id: 'google-sheets_action_rename-sheet',
  name: 'Rename Sheet',
  description:
    'Renames the title of an existing sheet in a Google Sheets document.',
  inputConfig: [
    shared.fields.dynamicSelectSpreadSheets,
    shared.fields.dynamicSelectSheetIds,
    createTextInputField({
      id: 'newTitle',
      label: 'New Sheet Title',
      description: 'The new title for the sheet.',
      placeholder: 'Enter new sheet title',
      required: {
        missingMessage: 'New sheet title is required',
        missingStatus: 'warning',
      },
    }),
  ],
  aiSchema: z.object({
    spreadsheet: z.string().describe('The ID of the Google Sheets document.'),
    sheet: z.string().describe('The ID of the sheet to be updated.'),
    newTitle: z.string().describe('The new title for the sheet.'),
  }),
  run: async ({ configValue, connection }) => {
    const sheets = shared.googleSheets({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { spreadsheet, sheet, newTitle } = configValue;

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheet,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId: parseInt(sheet, 10),
                title: newTitle,
              },
              fields: 'title',
            },
          },
        ],
      },
    });

    return response.data;
  },
  mockRun: async () => {
    return {
      spreadsheetId: 'mock-spreadsheet-id',
    };
  },
});

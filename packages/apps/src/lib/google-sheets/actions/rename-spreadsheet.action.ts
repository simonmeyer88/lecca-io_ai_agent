import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-sheets.shared';

export const renameSpreadsheet = createAction({
  id: 'google-sheets_action_rename-spreadsheet',
  name: 'Rename Spreadsheet',
  description: 'Renames the title of an existing Google Sheets document.',
  inputConfig: [
    shared.fields.dynamicSelectSpreadSheets,
    createTextInputField({
      id: 'newTitle',
      label: 'New Spreadsheet Title',
      description: 'The new title for the spreadsheet.',
      placeholder: 'Enter new spreadsheet title',
      required: {
        missingMessage: 'New spreadsheet title is required',
        missingStatus: 'warning',
      },
    }),
  ],
  aiSchema: z.object({
    spreadsheet: z.string().describe('The ID of the Google Sheets document.'),
    newTitle: z.string().describe('The new title for the spreadsheet.'),
  }),
  run: async ({ configValue, connection }) => {
    const sheets = shared.googleSheets({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { spreadsheet, newTitle } = configValue;

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheet,
      requestBody: {
        requests: [
          {
            updateSpreadsheetProperties: {
              properties: {
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

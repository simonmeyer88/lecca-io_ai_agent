import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-sheets.shared';

export const createSpreadsheet = createAction({
  id: 'google-sheets_action_create-spreadsheet',
  name: 'Create Spreadsheet',
  description: 'Creates a new Google Sheets document.',
  inputConfig: [
    createTextInputField({
      id: 'title',
      label: 'Title',
      description: 'The title of the new Google Sheets document.',
      placeholder: 'Enter title',
      required: {
        missingMessage: 'Title is required',
        missingStatus: 'warning',
      },
    }),
  ],
  aiSchema: z.object({
    title: z.string().describe('The title of the new Google Sheets document.'),
  }),
  run: async ({ configValue, connection }) => {
    const sheets = shared.googleSheets({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { title } = configValue;

    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title,
        },
      },
    });

    return response.data;
  },
  mockRun: async () => {
    return {
      properties: {
        title: 'Mock Spreadsheet',
      },
      sheets: [
        {
          properties: {
            title: 'Sheet1',
            gridProperties: {
              rowCount: 1000,
              columnCount: 26,
            },
          },
        },
      ],
      spreadsheetId: 'mock-spreadsheet-id',
      spreadsheetUrl:
        'https://docs.google.com/spreadsheets/d/some-id/edit?ouid=some-id',
    };
  },
});

import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-sheets.shared';

export const listSpreadsheets = createAction({
  id: 'google-sheets_action_list-spreadsheets',
  name: 'List Spreadsheets',
  description: 'Lists all spreadsheets available in your Google Drive',
  aiSchema: z.object({}),
  inputConfig: [],
  run: async ({ connection }) => {
    const drive = shared.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    // Get all spreadsheets from Google Drive
    const spreadSheets = await drive.files.list({
      q: "mimeType='application/vnd.google-apps.spreadsheet' and trashed=false",
      fields: 'files(id, name)',
    });

    return (
      spreadSheets?.data?.files?.map((file) => {
        return {
          id: file.id,
          name: file.name,
        };
      }) ?? []
    );
  },
  mockRun: async () => {
    return [
      {
        id: '1',
        name: 'Mock Spreadsheet 1',
      },
      {
        id: '2',
        name: 'Mock Spreadsheet',
      },
    ];
  },
});

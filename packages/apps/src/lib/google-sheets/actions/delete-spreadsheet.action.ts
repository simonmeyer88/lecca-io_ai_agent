import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-sheets.shared';

export const deleteSpreadsheet = createAction({
  id: 'google-sheets_action_delete-spreadsheet',
  name: 'Delete Spreadsheet',
  description: 'Delete a spreadsheet.',
  inputConfig: [
    {
      ...shared.fields.dynamicSelectSpreadSheets,
      description: 'Select the spreadsheet to delete.',
    },
  ],
  aiSchema: z.object({
    spreadsheet: z.string().describe('The ID of the spreadsheet to delete'),
  }),
  run: async ({ configValue, connection }) => {
    const googleDrive = shared.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { spreadsheet } = configValue;

    await googleDrive.files.delete({
      fileId: spreadsheet,
    });

    return {
      spreadsheetId: spreadsheet,
    };
  },
  mockRun: async () => {
    return {
      spreadsheetId: 'mock-spreadsheet-id',
    };
  },
});

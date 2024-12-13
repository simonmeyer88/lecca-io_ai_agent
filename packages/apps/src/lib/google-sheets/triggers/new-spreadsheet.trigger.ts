import {
  createTimeBasedPollTrigger,
  dateStringToMilliOrNull,
} from '@lecca-io/toolkit';

import { shared } from '../shared/google-sheets.shared';

export const newSpreadsheet = createTimeBasedPollTrigger({
  id: 'google-sheets_trigger_new-spreadsheet',
  name: 'New Spreadsheet',
  description: 'Triggers when a new spreadsheet is created inside any folder',
  inputConfig: [],
  run: async ({ connection }) => {
    const googleDrive = shared.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    // Search for documents
    const newestSpreadsheets = await googleDrive.files.list({
      q: `mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      pageSize: 10,
      fields: 'nextPageToken, files(id, name, createdTime)',
      orderBy: 'createdTime desc',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });

    return (
      newestSpreadsheets?.data?.files?.map((file) => ({
        spreadsheetId: file.id,
        createdTime: file.createdTime,
        title: file.name,
      })) ?? []
    );
  },
  mockRun: async () => {
    return [
      {
        spreadsheetId: 'mock-spreadsheet-id',
        title: 'Mock Spreadsheet Title',
        createdTime: new Date().toISOString(),
      },
    ];
  },
  extractTimestampFromResponse({ response }) {
    if (response.createdTime) {
      return dateStringToMilliOrNull(response.createdTime);
    } else {
      return null;
    }
  },
});

import {
  createTimeBasedPollTrigger,
  dateStringToMilliOrNull,
} from '@lecca-io/toolkit';

import { shared } from '../shared/google-sheets.shared';

export const newSpreadsheetInFolder = createTimeBasedPollTrigger({
  id: 'google-sheets_trigger_new-spreadsheet-in-folder',
  name: 'New Spreadsheet in Folder',
  description:
    'Triggers when a new spreadsheet is created inside selected folder (not subfolders).',
  inputConfig: [
    {
      ...shared.fields.dynamicSelectFolder,
      description: 'Select the folder to watch for new spreadsheets',
    },
  ],
  run: async ({ connection, configValue }) => {
    const googleDrive = shared.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    // Search for documents
    const newestSpreadsheets = await googleDrive.files.list({
      q: `mimeType='application/vnd.google-apps.spreadsheet' and trashed=false and '${configValue.folder}' in parents`,
      pageSize: 10,
      fields: 'nextPageToken, files(id, name, createdTime)',
      orderBy: 'createdTime desc',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });

    // Fetch the folder name
    const folderResponse = await googleDrive.files.get({
      fileId: configValue.folder,
      fields: 'name',
      supportsAllDrives: true,
    });

    const folderName = folderResponse?.data?.name ?? '';

    return (
      newestSpreadsheets?.data?.files?.map((file) => ({
        spreadsheetId: file.id,
        folderId: configValue.folder,
        createdTime: file.createdTime,
        spreadsheetTitle: file.name,
        folderTitle: folderName,
      })) ?? []
    );
  },
  mockRun: async () => {
    return [
      {
        spreadsheetId: 'mock-spreadsheet-id',
        folderId: 'mock-folder-id',
        spreadsheetTitle: 'Mock Spreadsheet Title',
        folderTitle: 'Mock Folder Title',
        createdTime: new Date().toISOString(),
      },
    ];
  },
  extractTimestampFromResponse: ({ response }) => {
    if (response.createdTime) {
      return dateStringToMilliOrNull(response.createdTime);
    } else {
      return null;
    }
  },
});

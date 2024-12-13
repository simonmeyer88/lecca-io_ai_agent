import {
  createTimeBasedPollTrigger,
  dateStringToMilliOrNull,
} from '@lecca-io/toolkit';

import { shared } from '../shared/google-drive.shared';

export const newFileInFolder = createTimeBasedPollTrigger({
  id: 'google-drive_trigger_new-file-in-folder',
  name: 'New File in Folder',
  description:
    'Triggers when a new file is created inside selected folder (not subfolders).',
  inputConfig: [
    {
      ...shared.fields.dynamicSelectFolder,
      description: 'Select the folder to watch for new files',
    },
  ],
  run: async ({ connection, configValue }) => {
    const googleDrive = shared.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    // Search for documents
    const newestFiles = await googleDrive.files.list({
      q: `trashed=false and '${configValue.folder}' in parents`,
      pageSize: 10,
      fields: 'nextPageToken, files(id, name, webViewLink, createdTime)',
      orderBy: 'createdTime desc',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });

    return newestFiles?.data?.files?.map((file) => ({
      createdTime: file.createdTime,
      documentId: file.id,
      title: file.name,
    }));
  },
  mockRun: async () => {
    return [
      {
        documentId: 'mock-file-id',
        title: 'Mock File Title',
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

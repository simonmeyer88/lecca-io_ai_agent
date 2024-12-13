import {
  createTimeBasedPollTrigger,
  dateStringToMilliOrNull,
} from '@lecca-io/toolkit';

import { shared } from '../shared/google-drive.shared';

export const newFile = createTimeBasedPollTrigger({
  id: 'google-drive_trigger_new-file',
  name: 'New File',
  description: 'Triggers when a new file is created inside any folder',
  inputConfig: [],
  run: async ({ connection }) => {
    const googleDrive = shared.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    // Search for documents
    const newestFiles = await googleDrive.files.list({
      q: `trashed=false and mimeType != 'application/vnd.google-apps.folder'`,
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

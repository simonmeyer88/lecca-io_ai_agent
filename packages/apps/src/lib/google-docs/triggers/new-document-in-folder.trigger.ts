import {
  createTimeBasedPollTrigger,
  dateStringToMilliOrNull,
} from '@lecca-io/toolkit';

import { shared } from '../shared/google-docs.shared';

export const newDocumentInFolder = createTimeBasedPollTrigger({
  id: 'google-docs_trigger_new-document-in-folder',
  name: 'New Document in Folder',
  description:
    'Triggers when a new document is created inside selected folder (not subfolders).',
  inputConfig: [
    {
      ...shared.fields.dynamicSelectFolder,
      description: 'Select the folder to watch for new documents',
    },
  ],
  run: async ({ connection, configValue }) => {
    const googleDrive = shared.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    // Search for documents
    const newestDocuments = await googleDrive.files.list({
      q: `mimeType='application/vnd.google-apps.document' and trashed=false and '${configValue.folder}' in parents`,
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
      newestDocuments?.data?.files?.map((file) => ({
        documentId: file.id,
        folderId: configValue.folder,
        createdTime: file.createdTime,
        documentTitle: file.name,
        folderTitle: folderName,
      })) ?? []
    );
  },
  mockRun: async () => {
    return [
      {
        documentId: 'mock-document-id',
        folderId: 'mock-folder-id',
        documentTitle: 'Mock Document Title',
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

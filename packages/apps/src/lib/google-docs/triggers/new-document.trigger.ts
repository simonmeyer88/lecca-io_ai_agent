import {
  createTimeBasedPollTrigger,
  dateStringToMilliOrNull,
} from '@lecca-io/toolkit';

import { shared } from '../shared/google-docs.shared';

export const newDocument = createTimeBasedPollTrigger({
  id: 'google-docs_trigger_new-document',
  name: 'New Document',
  description: 'Triggers when a new document is created inside any folder',
  inputConfig: [],
  run: async ({ connection }) => {
    const googleDrive = shared.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    // Search for documents
    const newestDocuments = await googleDrive.files.list({
      q: `mimeType='application/vnd.google-apps.document' and trashed=false`,
      pageSize: 10,
      fields: 'nextPageToken, files(id, name, webViewLink, createdTime)',
      orderBy: 'createdTime desc',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });

    return newestDocuments?.data?.files?.map((file) => ({
      createdTime: file.createdTime,
      documentId: file.id,
      title: file.name,
    }));
  },
  mockRun: async () => {
    return [
      {
        documentId: 'mock-document-id',
        title: 'Mock Document Title',
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

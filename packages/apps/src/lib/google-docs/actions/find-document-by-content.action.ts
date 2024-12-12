import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-docs.shared';

export const findDocumentByContent = createAction({
  id: 'google-docs_action_find-document-by-content',
  name: 'Find Document(s) by Content',
  description: 'Search for a document by its content.',
  aiSchema: z.object({
    search: z
      .string()
      .min(1)
      .describe('A search query to find a document by its content'),
  }),
  inputConfig: [
    createTextInputField({
      id: 'search',
      label: 'Search Query',
      description: 'A search query to find a document by its content.',
      placeholder: 'Search for...',
      required: {
        missingMessage: 'Search query is required',
        missingStatus: 'warning',
      },
    }),
  ],
  run: async ({ configValue, connection }) => {
    const googleDrive = shared.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { search } = configValue;

    // Construct the search query
    const searchQuery: string[] = [];
    if (search?.length) {
      searchQuery.push(`fullText contains '${search.replace("'", "\\'")}'`);
    }

    searchQuery.push(`mimeType='application/vnd.google-apps.document'`);

    // Search for documents
    const foundDocuments = await googleDrive.files.list({
      q: searchQuery.join(' and '),
      fields:
        'nextPageToken, files(id, name, webViewLink, createdTime, modifiedTime)',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });

    return (
      foundDocuments.data?.files?.map((file) => ({
        documentId: file.id,
        title: file.name,
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime,
        webViewLink: file.webViewLink,
      })) || []
    );
  },
  mockRun: async () => {
    return [
      {
        documentId: 'mock-document-id',
        title: 'Mock Document Title',
        createdTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString(),
        webViewLink: 'https://example.com',
      },
    ];
  },
});

import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-drive.shared';

export const findFolderByTitle = createAction({
  id: 'google-drive_action_find-folder-by-title',
  name: 'Find Folder(s) by Title',
  description: 'Search for folder(s) by the title',
  inputConfig: [
    createTextInputField({
      id: 'search',
      label: 'Search Query',
      description: 'A search query to find a folder by its title',
      placeholder: 'Search for...',
      required: {
        missingMessage: 'Search query is required',
        missingStatus: 'warning',
      },
    }),
  ],
  aiSchema: z.object({
    search: z
      .string()
      .min(1)
      .describe('A search query to find a folder by its title'),
  }),

  run: async ({ configValue, connection }) => {
    const { search } = configValue;

    const googleDrive = shared.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    // Construct the search query
    const searchQuery: string[] = [];
    if (search?.length) {
      searchQuery.push(`name contains '${search.replace("'", "\\'")}'`);
    }

    // Exclude folders from the search
    searchQuery.push(`mimeType = 'application/vnd.google-apps.folder'`);

    const foundDocuments = await googleDrive.files.list({
      q: searchQuery.join(' and '),
      fields:
        'nextPageToken, files(id, name, webViewLink, createdTime, modifiedTime)',
      orderBy: 'modifiedByMeTime desc,name_natural',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });

    return {
      data:
        foundDocuments.data?.files?.map((file) => ({
          fileId: file.id,
          title: file.name,
          createdTime: file.createdTime,
          modifiedTime: file.modifiedTime,
          webViewLink: file.webViewLink,
        })) || [],
    };
  },

  mockRun: async () => {
    return {
      data: [
        {
          fileId: 'mock-folder-id',
          title: 'Mock Folder Title',
          createdTime: new Date().toISOString(),
          modifiedTime: new Date().toISOString(),
          webViewLink: 'https://example.com',
        },
      ],
    };
  },
});

import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-sheets.shared';

export const findSpreadsheetByTitle = createAction({
  id: 'google-sheets_action_find-spreadsheet-by-title',
  name: 'Find Spreadsheet(s) by Title',
  description: 'Search for a spreadsheet by the title',
  inputConfig: [
    createTextInputField({
      id: 'search',
      label: 'Search Query',
      description: 'A search query to find a spreadsheet by its title',
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
      .describe(
        'A search query to find a spreadsheet by its title. This is required to search for a spreadsheet.',
      ),
  }),
  run: async ({ configValue, connection }) => {
    const googleDrive = shared.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { search } = configValue;

    const searchQuery: string[] = [];
    if (search?.length) {
      searchQuery.push(`name contains '${search.replace("'", "\\'")}'`);
    }

    searchQuery.push(`mimeType='application/vnd.google-apps.spreadsheet'`);

    const foundDocuments = await googleDrive.files.list({
      q: searchQuery.join(' and '),
      fields:
        'nextPageToken, files(id, name, webViewLink, createdTime, modifiedTime)',
      orderBy: 'modifiedByMeTime desc,name_natural',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });

    return (
      foundDocuments.data?.files?.map((file) => ({
        spreadsheetId: file.id,
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
        spreadsheetId: 'mock-spreadsheet-id',
        title: 'Mock Spreadsheet Title',
        createdTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString(),
        webViewLink: 'https://example.com',
      },
    ];
  },
});

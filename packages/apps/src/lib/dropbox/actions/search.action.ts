import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/dropbox.shared';

export const dropboxSearch = createAction({
  id: 'dropbox_action_search',
  name: 'Search',
  description: 'Search for files and folders in Dropbox',
  inputConfig: [
    {
      id: 'query',
      label: 'Search Query',
      description: 'The search query to find files or folders',
      inputType: 'text',
      placeholder: 'Enter search query',
      required: {
        missingMessage: 'Search query is required',
        missingStatus: 'warning',
      },
    },
    shared.fields.dynamicListFolders,
  ],
  aiSchema: z.object({
    query: z
      .string()
      .min(1)
      .describe('The search query to find files or folders'),
    path: z
      .string()
      .optional()
      .describe('The folder path to limit the search to'),
  }),
  run: async ({ configValue, connection, workspaceId, http }) => {
    const url = 'https://api.dropboxapi.com/2/files/search_v2';

    const data = {
      query: configValue.query,
      options: {
        path: configValue.path || '',
        max_results: 100,
        mode: 'filename',
      },
    };

    const result = await http.request({
      method: 'POST',
      url,
      data,
      headers: {
        Authorization: `Bearer ${connection?.accessToken}`,
      },
      workspaceId,
    });

    if (result?.data) {
      return result.data;
    } else {
      throw new Error(`Failed to search: ${result.data?.error_summary}`);
    }
  },
  mockRun: async () => {
    return {
      matches: [
        {
          metadata: {
            name: 'Example File.txt',
            path_lower: '/example file.txt',
            path_display: '/Example File.txt',
          },
          match_type: 'filename',
        },
      ],
    };
  },
});

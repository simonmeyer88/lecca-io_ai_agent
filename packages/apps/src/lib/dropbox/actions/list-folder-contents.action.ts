import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

export const listFolderContents = createAction({
  id: 'dropbox_action_list-folder-contents',
  name: 'List Folder Contents',
  description: 'List folder contents from Dropbox account',
  inputConfig: [
    {
      id: 'path',
      label: 'Folder Path',
      description:
        'The path of the folder to list contents from. Leave empty if you want to retrieve the root folder',
      inputType: 'text',
      placeholder: 'Leave empty to use root folder',
    },
  ],
  aiSchema: z.object({
    path: z
      .string()
      .min(1)
      .nullable()
      .optional()
      .describe(
        'The path of the folder to list contents from. Leave empty if you want to retrieve the root folder',
      ),
  }),
  run: async ({ configValue, connection, workspaceId, http }) => {
    const url = 'https://api.dropboxapi.com/2/files/list_folder';

    const data = {
      path: configValue.path || '',
      recursive: false, // Adjust this if you want recursive listing
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

    // Filter only folder entries
    if (result?.data) {
      return { folders: result.data };
    } else {
      throw new Error('Failed to list folders');
    }
  },
  mockRun: async () => ({
    folders: [
      {
        name: 'Folder 1',
        id: 'id:abc123',
        path_lower: '/folder1',
        path_display: '/folder1',
        '.tag': 'folder',
      },
    ],
  }),
});

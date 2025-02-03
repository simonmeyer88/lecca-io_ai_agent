import { FieldConfig, createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/dropbox.shared';

export const dropboxCreateFolder = createAction({
  id: 'dropbox_action_create-folder',
  name: 'Create Folder',
  description: 'Creates a folder in Dropbox',
  inputConfig: [
    {
      id: 'folderName',
      label: 'Folder Name',
      description: 'Name of the folder to create',
      inputType: 'text',
      placeholder: 'Enter folder name',
      required: {
        missingMessage: 'Folder name is required',
        missingStatus: 'warning',
      },
    },
    {
      ...shared.fields.dynamicListFolders,
      id: 'parentFolderPath',
      label: 'Parent Folder Path',
      placeholder: 'Enter parent folder path (optional)',
      description:
        'Path of the parent folder. Leave empty to create in root directory',
    } as FieldConfig,
  ],
  aiSchema: z.object({
    folderName: z.string().describe('The name of the folder to create'),
    parentFolderPath: z
      .string()
      .nullable()
      .optional()
      .describe(
        'The path of the parent folder where the new folder will be created. Leave empty if you want to create the folder in the root directory',
      ),
  }),
  run: async ({ configValue, connection, workspaceId, http }) => {
    const url = 'https://api.dropboxapi.com/2/files/create_folder_v2';

    const data = {
      path: `${configValue.parentFolderPath || ''}/${configValue.folderName}`,
      autorename: false,
    };

    const result = await http.request({
      method: 'POST',
      url,
      headers: {
        Authorization: `Bearer ${connection?.accessToken}`,
      },
      data,
      workspaceId,
    });

    if (result?.data?.metadata) {
      return result.data;
    } else {
      throw new Error(`Failed to create folder: ${result.data?.error_summary}`);
    }
  },
  mockRun: async () => {
    return {
      metadata: {
        name: 'New Folder',
        path_lower: '/new folder',
        path_display: '/New Folder',
        id: 'id:newfolder',
      },
    };
  },
});

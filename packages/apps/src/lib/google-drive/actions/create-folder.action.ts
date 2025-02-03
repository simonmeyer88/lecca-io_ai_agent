import { createAction } from '@lecca-io/toolkit';
import { createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-drive.shared';

export const createFolder = createAction({
  id: 'google-drive_action_create-folder',
  name: 'New Folder',
  description: 'Creates a new folder.',
  aiSchema: z.object({
    'folder-name': z.string().describe('The name of the new folder'),
    'parent-folder': z
      .string()
      .nullable()
      .optional()
      .describe(
        'The ID of the parent folder where the new folder will be saved',
      ),
  }),
  inputConfig: [
    {
      ...shared.fields.dynamicSelectFolder,
      id: 'parent-folder',
      label: 'Parent Folder',
      description: 'Select where to create this new folder.',
    },
    createTextInputField({
      id: 'folder-name',
      label: 'Folder Name',
      description: 'The name of the new folder.',
      placeholder: 'Add a folder name',
      required: {
        missingMessage: 'Folder Name is required',
        missingStatus: 'warning',
      },
    }),
  ],

  run: async ({ configValue, connection }) => {
    const folderName = configValue['folder-name'];
    const parentFolder = configValue['parent-folder'];

    const googleDrive = shared.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    // Create a new folder
    const newFolder = await googleDrive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolder && parentFolder != 'root' ? [parentFolder] : [],
      },
      supportsAllDrives: true,
      fields: 'id, name, webViewLink, createdTime',
    });

    return {
      id: newFolder.data.id,
      name: newFolder.data.name,
      webViewLink: newFolder.data.webViewLink,
      createdTime: newFolder.data.createdTime,
    };
  },

  mockRun: async () => {
    return {
      id: 'mock-folder-id',
      name: 'Mock Folder',
      webViewLink: 'https://example.com',
      createdTime: new Date().toISOString(),
    };
  },
});

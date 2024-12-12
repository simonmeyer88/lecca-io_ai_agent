import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-drive.shared';

export const moveFolder = createAction({
  id: 'google-drive_action_move-folder',
  name: 'Move Folder',
  description: `Moves a folder created by ${process.env.PLATFORM_NAME} into another folder.`,
  inputConfig: [
    {
      ...shared.fields.dynamicSelectFolder,
      id: 'folder-to-move',
      label: 'Folder to Move',
      selectOptions: undefined,
      defaultValue: undefined,
      description: '',
    },
    {
      ...shared.fields.dynamicSelectFolder,
      id: 'target-folder',
      label: 'Folder Destination',
      description: 'Select the folder where the file will be moved to.',
    },
  ],
  aiSchema: z.object({
    'folder-to-move': z
      .string()
      .min(1)
      .describe('The ID of the folder to move'),
    'target-folder': z
      .string()
      .min(1)
      .describe('The ID of the folder where the folder will be moved to'),
  }),

  run: async ({ configValue, connection }) => {
    const googleDrive = shared.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const folderToMove = configValue['folder-to-move'];
    const targetFolder = configValue['target-folder'];

    if (folderToMove === targetFolder) {
      throw new Error('Cannot move a folder into itself.');
    }

    const fileBeingMoved = await googleDrive.files.get({
      fileId: folderToMove,
      fields: 'id, name, parents',
    });

    const response = await googleDrive.files.update({
      fileId: folderToMove,
      addParents: targetFolder,
      removeParents: fileBeingMoved.data.parents?.join(','),
    });

    return {
      folderId: response.data.id,
      folderName: response.data.name,
      targetFolderId: targetFolder,
    };
  },

  mockRun: async () => {
    return {
      folderId: 'mock-folder-id',
      folderName: 'Mock Folder Name',
      targetFolderId: 'mock-target-folder-id',
    };
  },
});

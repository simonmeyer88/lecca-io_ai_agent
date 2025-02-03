import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-drive.shared';

export const moveFile = createAction({
  id: 'google-drive_action_move-file',
  name: 'Move File',
  description: `Moves a file created by this platform into a designated folder.`,
  inputConfig: [
    {
      ...shared.fields.dynamicSelectFile,
      label: 'File to Move',
      description: '',
    },
    {
      ...shared.fields.dynamicSelectFolder,
      label: 'File Destination',
      description: 'Select the folder where the file will be moved to.',
    },
  ],
  aiSchema: z.object({
    file: z.string().describe('The ID of the file to move'),
    folder: z
      .string()
      .describe('The ID of the folder where the file will be moved to'),
  }),
  run: async ({ configValue, connection }) => {
    const googleDrive = shared.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { file, folder } = configValue;

    const fileBeingMoved = await googleDrive.files.get({
      fileId: file,
      fields: 'id, name, parents',
    });

    const response = await googleDrive.files.update({
      fileId: file,
      addParents: folder,
      removeParents: fileBeingMoved.data.parents?.join(','),
    });

    return {
      id: response.data.id,
      fileName: response.data.name,
      folderId: folder,
    };
  },
  mockRun: async () => {
    return {
      id: 'mock-file-id',
      fileName: 'Mock File Name',
      folderId: 'mock-folder-id',
    };
  },
});

import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-drive.shared';

export const deleteFile = createAction({
  id: 'google-drive_action_delete-file',
  name: 'Delete File',
  description: `Delete a file created by this platform.`,
  aiSchema: z.object({
    file: z.string().min(1).describe('The ID of the file to delete'),
  }),
  inputConfig: [
    {
      id: 'markdown',
      inputType: 'markdown',
      label: '',
      description: '',
      markdown: `You will only be able to delete files that were created by this platform.`,
    },
    shared.fields.dynamicSelectFile,
  ],
  run: async ({ configValue, connection }) => {
    const googleDrive = shared.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { file } = configValue;

    await googleDrive.files.delete({
      fileId: file,
    });

    return {
      fileId: file,
    };
  },
  mockRun: async () => {
    return {
      fileId: 'mock-file-id',
    };
  },
});

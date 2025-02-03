import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-drive.shared';

export const copyFile = createAction({
  id: 'google-drive_action_copy-file',
  name: 'Copy File',
  description: 'Copies a file into a designated folder.',
  aiSchema: z.object({
    file: z.string().describe('The ID of the file to copy'),
    'file-name': z.string().describe('The name of the copied file'),
    'parent-folder': z
      .string()
      .nullable()
      .optional()
      .describe('The ID of the folder where the new document will be saved'),
  }),
  inputConfig: [
    shared.fields.dynamicSelectFile,
    shared.fields.dynamicSelectFolder,
    createTextInputField({
      id: 'file-name',
      label: 'File Name',
      description: 'The name of the copied file.',
      placeholder: 'Add a file name',
      required: {
        missingMessage: 'File Name is required',
        missingStatus: 'warning',
      },
    }),
  ],
  run: async ({ configValue, connection }) => {
    const googleDrive = shared.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const fileToCopyId = configValue['file'];
    const fileName = configValue['file-name'];
    const parentFolder = configValue['parent-folder'];

    const newFile = await googleDrive.files.copy({
      fileId: fileToCopyId,
      requestBody: {
        name: fileName,
        parents: parentFolder && parentFolder != 'root' ? [parentFolder] : [],
      },
      supportsAllDrives: true,
    });

    return {
      id: newFile.data.id,
      newFileName: newFile.data.name,
      webViewLink: newFile.data.webViewLink,
      createdTime: newFile.data.createdTime,
    };
  },
  mockRun: async () => {
    return {
      id: 'mock-file-id',
      newFileName: 'Mock File Name',
      webViewLink: 'https://example.com',
      createdTime: new Date().toISOString(),
    };
  },
});

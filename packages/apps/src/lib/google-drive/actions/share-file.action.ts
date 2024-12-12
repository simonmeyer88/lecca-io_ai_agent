import {
  createAction,
  createSelectInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-drive.shared';

export const shareFile = createAction({
  id: 'google-drive_action_share-file',
  name: 'Share File',
  description: `Share a file that ${process.env.PLATFORM_NAME} has created.`,
  inputConfig: [
    shared.fields.dynamicSelectFile,
    createSelectInputField({
      id: 'role',
      label: 'Role',
      description: 'The role of the user',
      placeholder: 'Select a role',
      selectOptions: [
        {
          label: 'Writer',
          value: 'writer',
        },
        {
          label: 'Commenter',
          value: 'commenter',
        },
        {
          label: 'Reader',
          value: 'reader',
        },
      ],
      required: {
        missingMessage: 'Content is required',
        missingStatus: 'warning',
      },
    }),
    createTextInputField({
      id: 'email',
      label: 'Email',
      description: 'The email address of the user',
      placeholder: 'Enter email',
      required: {
        missingMessage: 'Email is required',
        missingStatus: 'warning',
      },
    }),
  ],
  aiSchema: z.object({
    file: z.string().min(1).describe('The ID of the file to share'),
    role: z
      .enum(['writer', 'commenter', 'reader'])
      .describe('The role of the user'),
    email: z.string().email().min(1).describe('The email of the user'),
  }),
  run: async ({ configValue, connection }) => {
    const googleDrive = shared.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { file, role, email } = configValue;

    await googleDrive.permissions.create({
      fileId: file,
      requestBody: {
        role: role,
        type: 'user',
        emailAddress: email,
      },
    });

    return {
      fileId: file,
      role: role,
      emailAddress: email,
    };
  },
  mockRun: async () => {
    return {
      fileId: 'mock-file-id',
      role: 'commenter',
      emailAddress: 'example@test.com',
    };
  },
});

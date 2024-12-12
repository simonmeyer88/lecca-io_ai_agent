import {
  createAction,
  createSelectInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-docs.shared';

export const shareDocument = createAction({
  id: 'google-docs_action_share-document',
  name: 'Share Document',
  description: 'Share a document that has been created.',
  aiSchema: z.object({
    document: z.string().min(1).describe('The ID of the document to share'),
    role: z
      .enum(['writer', 'commenter', 'reader'])
      .describe('The role of the user'),
    email: z.string().email().min(1).describe('The email of the user'),
  }),
  inputConfig: [
    shared.fields.dynamicSelectDocuments,
    createSelectInputField({
      id: 'role',
      label: 'Role',
      description: 'The role of the user',
      placeholder: 'Select a role',
      selectOptions: [
        { label: 'Writer', value: 'writer' },
        { label: 'Commenter', value: 'commenter' },
        { label: 'Reader', value: 'reader' },
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

  run: async ({ configValue, connection }) => {
    const googleDrive = shared.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { document, role, email } = configValue;

    await googleDrive.permissions.create({
      fileId: document,
      requestBody: {
        role: role,
        type: 'user',
        emailAddress: email,
      },
    });

    return {
      documentId: document,
      role: role,
      emailAddress: email,
    };
  },

  mockRun: async () => {
    return {
      documentId: 'mock-document-id',
      role: 'commenter',
      emailAddress: 'example@test.com',
    };
  },
});

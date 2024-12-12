import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-docs.shared';

export const deleteDocument = createAction({
  id: 'google-docs_action_delete-document',
  name: 'Delete Document',
  description: 'Delete a document.',
  inputConfig: [
    {
      ...shared.fields.dynamicSelectDocuments,
      description: 'Select the document to delete.',
    },
  ],
  aiSchema: z.object({
    document: z.string().min(1).describe('The ID of the document to delete'),
  }),
  run: async ({ configValue, connection }) => {
    const googleDrive = shared.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { document } = configValue;

    await googleDrive.files.delete({
      fileId: document,
    });

    return {
      documentId: document,
    };
  },
  mockRun: async () => {
    return {
      documentId: 'mock-document-id',
    };
  },
});

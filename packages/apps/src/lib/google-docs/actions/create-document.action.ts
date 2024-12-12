import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-docs.shared';

export const createDocument = createAction({
  id: 'google-docs_action_create-document',
  name: 'New Document',
  description: 'Creates a new document with provided content.',
  inputConfig: [
    createTextInputField({
      id: 'new-name',
      label: 'New Document Name',
      description: 'The name of the new document.',
      placeholder: 'Add a name',
      required: {
        missingMessage: 'Name is required',
        missingStatus: 'warning',
      },
    }),
    createTextInputField({
      id: 'content',
      label: 'Text Content',
      description: 'The content of the new document.',
      placeholder: 'Enter text',
      required: {
        missingMessage: 'Content is required',
        missingStatus: 'warning',
      },
    }),
  ],
  aiSchema: z.object({
    'new-name': z.string().min(1).describe('The name of the new document'),
    content: z.string().min(1).describe('The content of the new document'),
  }),
  run: async ({ configValue, connection }) => {
    const googleDocs = shared.googleDocs({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { content } = configValue;

    const newDocument = await googleDocs.documents.create({
      requestBody: {
        title: configValue['new-name'],
      },
    });

    await googleDocs.documents.batchUpdate({
      documentId: newDocument.data.documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: 1,
              },
              text: content,
            },
          },
        ],
      },
    });

    return {
      documentId: newDocument.data.documentId,
      revisionId: newDocument.data.revisionId,
      title: newDocument.data.title,
    };
  },
  mockRun: async () => {
    return {
      documentId: 'mock-document-id',
      title: 'Document Title',
      revisionId: 'mock-revision-id',
    };
  },
});

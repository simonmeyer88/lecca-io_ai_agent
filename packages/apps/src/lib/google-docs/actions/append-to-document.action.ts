import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-docs.shared';

export const appendToDocument = createAction({
  id: 'google-docs_action_append-to-document',
  name: 'Append to Document',
  description: 'Appends text to an existing document.',
  aiSchema: z.object({
    document: z.string().describe('The ID of the document to append to'),
    content: z.string().describe('The content to append to the document'),
  }),
  inputConfig: [
    {
      ...shared.fields.dynamicSelectDocuments,
      label: 'Document',
      description: 'Select a document to append text to.',
    },
    {
      id: 'content',
      label: 'Text Content',
      description: 'The content that will be appended.',
      inputType: 'text',
      placeholder: 'Enter text',
      required: {
        missingMessage: 'Content is required',
        missingStatus: 'warning',
      },
    },
  ],
  run: async ({ configValue, connection }) => {
    const googleDocs = shared.googleDocs({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { content, document } = configValue;

    const existingDocument = await googleDocs.documents.get({
      documentId: document,
    });

    // Find the end index of the existing content
    const endIndex = existingDocument.data.body.content.reduce(
      (acc, cur) =>
        acc +
        (cur.paragraph
          ? cur.paragraph?.elements?.reduce(
              (sum, el) => sum + (el.textRun?.content?.length || 0),
              0,
            )
          : 0),
      0,
    );

    await googleDocs.documents.batchUpdate({
      documentId: document,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: endIndex, // Position to append text, at the end of the document
              },
              text: content,
            },
          },
        ],
      },
    });

    return {
      documentId: existingDocument.data.documentId,
      revisionId: existingDocument.data.revisionId,
      title: existingDocument.data.title,
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

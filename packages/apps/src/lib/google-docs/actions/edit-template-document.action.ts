import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-docs.shared';

export const editTemplate = createAction({
  id: 'google-docs_action_edit-template-file',
  name: 'Edit Template Document',
  description: 'Edits a template document by replacing {{placeholders}}.',
  inputConfig: [
    {
      ...shared.fields.dynamicSelectDocuments,
      label: 'Template Document',
      description: 'A template document has {{placeholders}}.',
    },
    shared.fields.dynamicSelectPlaceholders,
  ],

  aiSchema: z.object({
    document: z.string().min(1).describe('The ID of the template document'),
    placeholders: z.array(
      z.object({
        key: z.string().min(1).describe('The placeholder key'),
        value: z
          .string()
          .min(1)
          .describe('The value to replace the placeholder'),
      }),
    ),
  }),

  run: async ({ configValue, connection }) => {
    const googleDocs = shared.googleDocs({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const placeholderMap = configValue.placeholders;
    const documentId = configValue.document;
    const requests: any = [];

    placeholderMap.forEach((map) => {
      const { key, value } = map;

      requests.push({
        replaceAllText: {
          containsText: {
            text: '{{' + key + '}}',
            matchCase: true,
          },
          replaceText: String(value),
        },
      });
    });

    await googleDocs.documents.batchUpdate({
      documentId,
      requestBody: {
        requests: requests,
      },
    });

    const updatedTemplateDocument = await googleDocs.documents.get({
      documentId: configValue.document,
    });

    return {
      documentId: updatedTemplateDocument.data.documentId,
      revisionId: updatedTemplateDocument.data.revisionId,
      title: updatedTemplateDocument.data.title,
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

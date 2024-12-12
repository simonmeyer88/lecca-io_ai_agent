import { createAction } from '@lecca-io/toolkit';
import { createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-docs.shared';

export const getDocumentText = createAction({
  id: 'google-docs_action_get-document-text',
  name: 'Get Document Text',
  description: 'Get the text of a Google Document',
  inputConfig: [
    createTextInputField({
      id: 'documentId',
      label: 'Document Id',
      description: '',
      required: {
        missingMessage: 'Document ID is required',
        missingStatus: 'warning',
      },
    }),
  ],
  aiSchema: z.object({
    documentId: z.string().min(1).describe('The Google Document ID'),
  }),
  run: async ({ configValue, connection }) => {
    const docs = shared.googleDocs({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { documentId } = configValue;

    const document = await docs.documents.get({
      documentId: documentId,
    });

    return { text: extractTextFromDocument(document.data.body.content) };
  },
  mockRun: async () => {
    return { text: 'The document contents would be here.' };
  },
});

const extractTextFromDocument = (content: any): string => {
  let text = '';
  if (content) {
    content.forEach((value: any) => {
      if (value.paragraph) {
        value.paragraph.elements.forEach((elem: any) => {
          if (elem.textRun) {
            text += elem.textRun.content;
          }
        });
      }
    });
  }
  return text;
};

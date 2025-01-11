import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/anchor-browser.shared';

export const askWebpage = createAction({
  id: 'anchor-browser_action_ask-webpage',
  name: 'Ask Webpage',
  description:
    'Ask a question about the content of a webpage and retrieve an AI generated answer',
  inputConfig: [
    createTextInputField({
      id: 'url',
      label: 'URL',
      description: 'URL of the webpage to screenshot',
      placeholder: 'https://example.com',
      required: {
        missingMessage: 'URL is required',
        missingStatus: 'warning',
      },
    }),
    createTextInputField({
      id: 'question',
      label: 'Question',
      description: 'Question to ask about the content of the webpage',
      placeholder: 'Add your question',
      required: {
        missingMessage: 'Question is required',
        missingStatus: 'warning',
      },
    }),
    shared.fields.sessionId,
  ],
  aiSchema: z.object({
    url: z.string().describe('URL of the webpage to screenshot'),
    question: z
      .string()
      .describe('Question to ask about the content of the webpage'),
    sessionId: z
      .string()
      .describe('Optional session to reference when performing this action')
      .optional()
      .nullable(),
  }),
  run: async ({ connection, http, workspaceId, configValue }) => {
    const { url, question, sessionId } = configValue;

    const data = {
      url,
      question,
      sessionId: sessionId || undefined,
    };

    const response = await http.request({
      method: 'POST',
      url: `https://connect.anchorbrowser.io/tools/ask-webpage?apiKey=${connection?.apiKey}`,
      data,
      workspaceId,
    });

    return response.data;
  },
  mockRun: async () => {
    return {
      answer:
        'This is a mock answer to the question asked about the content of the webpage',
    };
  },
});

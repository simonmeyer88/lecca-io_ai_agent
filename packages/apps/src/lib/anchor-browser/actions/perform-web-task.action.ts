import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/anchor-browser.shared';

export const performWebTask = createAction({
  id: 'anchor-browser_action_perform-web-task',
  name: 'Perform Web Task',
  description: 'Perform a task on a webpage and retrieve the result',
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
      id: 'task',
      label: 'Task',
      description: 'The task to be autonomously completed.',
      placeholder: 'E.g. Summarize the main article',
      required: {
        missingMessage: 'Task is required',
        missingStatus: 'warning',
      },
    }),
    shared.fields.sessionId,
  ],
  aiSchema: z.object({
    url: z.string().describe('URL of the webpage to screenshot'),
    task: z.string().describe('The task to be autonomously completed.'),
    sessionId: z
      .string()
      .describe('Optional session to reference when performing this action')
      .optional()
      .nullable(),
  }),
  run: async ({ connection, http, workspaceId, configValue }) => {
    const { url, task, sessionId } = configValue;

    const data = {
      url,
      task,
      sessionId: sessionId || undefined,
    };

    const response = await http.request({
      method: 'POST',
      url: `https://connect.anchorbrowser.io/tools/perform-web-task?apiKey=${connection?.apiKey}`,
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

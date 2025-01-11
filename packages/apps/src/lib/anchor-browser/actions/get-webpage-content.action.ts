import {
  createAction,
  createSelectInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/anchor-browser.shared';

export const getWebpageContent = createAction({
  id: 'anchor-browser_action_get-webpage-content',
  name: 'Get Webpage Content',
  description: 'Get the content of a webpage',
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
    createSelectInputField({
      id: 'format',
      label: 'Format',
      description: 'Output format of the content',
      selectOptions: [
        { value: 'markdown', label: 'Markdown' },
        { value: 'html', label: 'HTML' },
      ],
      defaultValue: 'markdown',
    }),
    shared.fields.sessionId,
  ],
  aiSchema: z.object({
    url: z.string().describe('URL of the webpage to screenshot'),
    format: z
      .enum(['markdown', 'html'])
      .default('markdown')
      .describe('Output format of the content'),
    sessionId: z
      .string()
      .describe('Optional session to reference when performing this action')
      .optional()
      .nullable(),
  }),
  run: async ({ connection, http, workspaceId, configValue }) => {
    const { url, format, sessionId } = configValue;

    const data = {
      url,
      format,
      sessionId: sessionId || undefined,
    };

    const response = await http.request({
      method: 'POST',
      url: `https://connect.anchorbrowser.io/tools/fetch-webpage?apiKey=${connection?.apiKey}`,
      data,
      workspaceId,
    });

    return { content: response.data };
  },
  mockRun: async () => {
    return {
      content: '# This is the content of the webpage in markdown or html',
    };
  },
});

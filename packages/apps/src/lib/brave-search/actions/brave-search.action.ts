import {
  createAction,
  createNumberInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

export const braveSearchAction = createAction({
  id: 'brave-search_action_brave-search',
  name: 'Search the Web',
  description: 'Perform a web search using Brave Search API.',
  viewOptions: {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
      },
    },
  },
  inputConfig: [
    createTextInputField({
      id: 'query',
      label: 'Search Query',
      description: 'Google search query.',
      placeholder: 'What do you want to search for?',
      required: {
        missingMessage: 'Please enter a search query',
        missingStatus: 'warning',
      },
    }),
    createNumberInputField({
      id: 'count',
      label: 'Number of Results',
      description: 'Number of search results to return.',
      placeholder: 'Defaults to 20',
      numberOptions: {
        min: 1,
        max: 20,
        step: 1,
      },
    }),
  ],
  aiSchema: z.object({
    query: z.string().min(1).describe('Search query for serper.dev API'),
    count: z
      .number()
      .int()
      .min(1)
      .max(20)
      .default(20)
      .describe('Number of search results to return'),
  }),
  run: async ({ configValue, workspaceId, http, connection }) => {
    const { query, count } = configValue;

    const response = await http.request({
      method: 'GET',
      url: `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=${count}`,
      headers: {
        Accept: 'application/json',
        'X-Subscription-Token': connection.apiKey,
      },
      workspaceId,
    });

    return response.data;
  },
  mockRun: async () => {
    //No mock available
    return null;
  },
});

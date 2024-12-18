import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const serperSearch = createAction({
  id: 'serper_action_serper-search',
  name: 'Search Google',
  description: 'Perform Google search using Serper API.',
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
  ],
  aiSchema: z.object({
    query: z.string().min(1).describe('Search query for serper.dev API'),
  }),
  run: async ({ configValue, workspaceId, http, connection }) => {
    const { query } = configValue;

    const response = await http.request({
      method: 'POST',
      url: 'https://google.serper.dev/search',
      data: { q: query },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-API-KEY': connection.apiKey,
      },
      workspaceId,
    });

    return response.data;
  },

  mockRun: async () => {
    return {
      results: [
        {
          title: 'Apple',
          link: 'https://www.apple.com/',
          snippet:
            'Discover the innovative world of Apple and shop everything iPhone, iPad, Apple Watch, Mac, and Apple TV, plus explore accessories, entertainment, ...',
          sitelinks: [
            {
              title: 'Support',
              link: 'https://support.apple.com/',
            },
            {
              title: 'iPhone',
              link: 'https://www.apple.com/iphone/',
            },
            {
              title: 'Apple makes business better.',
              link: 'https://www.apple.com/business/',
            },
            {
              title: 'Mac',
              link: 'https://www.apple.com/mac/',
            },
          ],
        },
      ],
    };
  },
});

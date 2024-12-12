import {
  createAction,
  createMarkdownField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

export const googleSearch = createAction({
  id: 'web_action_google-search',
  name: 'Google Search',
  description: 'Search the web using Google.',
  iconUrl: `${process.env.INTEGRATION_ICON_BASE_URL}/actions/web_action_google-search.svg`,
  inputConfig: [
    createTextInputField({
      id: 'q',
      label: 'Search Query',
      description: 'Google search query.',
      placeholder: 'What do you want to search for?',
      required: {
        missingMessage: 'Please enter a search query',
        missingStatus: 'warning',
      },
    }),
    createMarkdownField({
      id: 'markdown',
      markdown: 'Note that this action uses 1 credit per search.',
    }),
  ],

  aiSchema: z.object({
    q: z.string().min(1).describe('Search query for serper.dev API'),
  }),

  run: async ({
    configValue,
    workspaceId,
    projectId,
    agentId,
    executionId,
    workflowId,
    http,
    credits,
  }) => {
    const { q } = configValue;

    await credits.checkIfWorkspaceHasEnoughCredits({
      workspaceId,
      usageType: 'serper',
    });

    const response = await http.request({
      method: 'POST',
      url: 'https://google.serper.dev/search',
      data: { q },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-API-KEY': process.env.SERPER_API_KEY,
      },
      workspaceId,
    });

    const data = response.data;

    const formattedResponse = {
      results:
        data.organic?.map((item: any) => ({
          title: item.title,
          link: item.link,
          snippet: item.snippet,
        })) ?? [],
    };

    const calculatedCreditsFromToken = credits.transformCostToCredits({
      usageType: 'serper',
      data: {
        credits: data.credits,
      },
    });

    const creditUsage = await credits.updateWorkspaceCredits({
      workspaceId,
      creditsUsed: calculatedCreditsFromToken,
      projectId,
      data: {
        ref: {
          agentId,
          executionId,
          workflowId,
        },
        details: {
          actionId: 'web_action_google-search',
        },
      },
    });

    return {
      ...formattedResponse,
      creditUsage,
    };
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

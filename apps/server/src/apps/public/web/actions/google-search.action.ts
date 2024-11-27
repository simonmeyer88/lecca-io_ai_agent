import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';
import { CreditUsageResponse } from '@/modules/global/credits/credits.service';

import { Web } from '../web.app';

export class GoogleSearch extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Web;
  id = 'web_action_google-search';
  needsConnection = false;
  name = 'Google Search';
  iconUrl: null | string =
    `${ServerConfig.INTEGRATION_ICON_BASE_URL}/actions/${this.id}.svg`;
  description = 'Search the web using Google.';
  aiSchema = z.object({
    q: z.string().min(1).describe('Search query for serper.dev API'),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'q',
      label: 'Search Query',
      description: 'Google search query.',
      inputType: 'text',
      placeholder: 'What do you want to search for?',
      required: {
        missingMessage: 'Please enter a search query',
        missingStatus: 'warning',
      },
    },
    {
      id: 'markdown',
      inputType: 'markdown',
      description: '',
      label: '',
      markdown: 'Note that this action uses 1 credit per search.',
    },
  ];

  async run({
    configValue,
    workspaceId,
    projectId,
    agentId,
    executionId,
    workflowId,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
    const { q } = configValue;

    await this.app.credits.checkIfWorkspaceHasEnoughCredits({
      workspaceId,
      usageType: 'serper',
    });

    const url = `https://google.serper.dev/search`;

    const response = await this.app.http.loggedRequest({
      method: 'POST',
      url,
      data: {
        q,
      },
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'X-API-KEY': ServerConfig.SERPER_API_KEY,
      },
      workspaceId,
    });

    const data = response.data;

    const formattedResponse = {
      results:
        data.organic?.map((item: any) => {
          return {
            title: item.title,
            link: item.link,
            snippet: item.snippet,
          };
        }) ?? [],
    };

    const calculatedCreditsFromToken = this.app.credits.transformCostToCredits({
      usageType: 'serper',
      data: {
        credits: data.credits,
      },
    });

    const creditUsage = await this.app.credits.updateWorkspaceCredits({
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
          actionId: this.id,
        },
      },
    });

    return {
      ...formattedResponse,
      creditUsage,
    };
  }

  async mockRun(): Promise<Response> {
    return { results: [mock] };
  }
}

const mock = {
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
};

type ConfigValue = z.infer<GoogleSearch['aiSchema']>;

type Response = {
  results: (typeof mock)[];
  creditUsage?: CreditUsageResponse;
};

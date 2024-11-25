import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { z } from 'zod';
import { Web } from '../web.app';
import { ServerConfig } from '@/config/server.config';
import { CreditUsageResponse } from '@/modules/global/credits/credits.service';

export class ExtractWebsiteContent extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Web;
  id() {
    return 'web_action_extract-website-content';
  }
  iconUrl(): null | string {
    return `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.app.id}.svg`;
  }
  name() {
    return 'Extract Website Content';
  }
  description() {
    return 'Visits a website and extracts the text content';
  }
  aiSchema() {
    return z.object({
      url: z.string().min(1).describe('The URL of the website to visit'),
    });
  }
  needsConnection(): boolean {
    return false;
  }
  inputConfig(): InputConfig[] {
    return [
      {
        id: 'url',
        label: 'URL',
        description: 'The URL of the website to visit',
        inputType: 'text',
        placeholder: 'Add URL',
        required: {
          missingMessage: 'Please enter a URL',
          missingStatus: 'warning',
        },
      },
      {
        id: 'markdown',
        label: '',
        description: '',
        inputType: 'markdown',
        markdown:
          'If the website is static, use the "Extract Static Website Content" action instead. If the website loads dynamic data using Javascript, then use this action.',
      },
      {
        id: 'markdown2',
        inputType: 'markdown',
        description: '',
        label: '',
        markdown:
          'Note that this action uses credits per run. The amount depends on the duration of the process.',
      },
    ];
  }

  async run({
    configValue,
    workspaceId,
    projectId,
    agentId,
    executionId,
    workflowId,
  }: RunActionArgs<ConfigValue>): Promise<ResponseType> {
    const { url } = configValue;

    await this.app.credits.checkIfWorkspaceHasEnoughCredits({
      workspaceId,
      usageType: 'extract-dynamic-website-content',
    });

    const taskUrl = `https://api.apify.com/v2/actor-tasks/${ServerConfig.APIFY_EXTRACT_DYNAMIC_CONTENT_TASK_ID}/runs?timeout=60&waitForFinish=60`;

    let urlToSearch = url;
    if (
      !urlToSearch.startsWith('http://') &&
      !urlToSearch.startsWith('https://')
    ) {
      urlToSearch = `https://${urlToSearch}`;
    }

    //Run the task and wait for the response (max 60 seconds)
    const runSyncResponse = (await this.app.http.loggedRequest({
      method: 'POST',
      url: taskUrl,
      data: {
        startUrls: [{ url: urlToSearch }],
      },
      headers: {
        Authorization: `Bearer ${ServerConfig.APIFY_API_KEY}`,
      },
      workspaceId,
    })) as { data: { data: RunSyncResponse } };

    const datasetId = runSyncResponse.data?.data?.defaultDatasetId;

    if (!datasetId) {
      throw new Error('Web search ran, but no data was returned.');
    }

    //Get the data from the dataset
    const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items`;

    const datasetItemResponse = (await this.app.http.loggedRequest({
      method: 'GET',
      url: datasetUrl,
      headers: {
        Authorization: `Bearer ${ServerConfig.APIFY_API_KEY}`,
      },
      workspaceId,
    })) as { data: DatasetItemResponse };

    const items = datasetItemResponse.data;

    //The task is setup to only retrieve one item so we can just get the first item
    const firstItem = items[0];
    const text = firstItem.text ?? '';

    const calculatedCreditsFromToken = this.app.credits.transformCostToCredits({
      usageType: 'extract-dynamic-website-content',
      data: {
        cost: runSyncResponse.data.data.usageTotalUsd,
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
          actionId: this.id(),
        },
      },
    });

    return {
      url: firstItem.url,
      text,
      creditUsage,
    };
  }

  async mockRun(): Promise<ResponseType> {
    return {
      url: 'https://example.com',
      text: 'The content of the website in text format will be here',
    };
  }
}

type ResponseType = {
  url: string;
  text: string;
  creditUsage?: CreditUsageResponse;
};

type ConfigValue = z.infer<ReturnType<ExtractWebsiteContent['aiSchema']>>;

type RunSyncResponse = {
  id: string;
  actId: string;
  actorTaskId: string;
  buildId: string;
  finishedAt: null | string;
  usageTotalUsd: number;
  status: 'RUNNING' | 'SUCCEEDED' | 'FAILED';
  defaultDatasetId: string;
};

type DatasetItemResponse = [
  {
    crawl: {
      depth: number;
      httpStatusCode: number; //999
      loadedTime: string; //2021-10-03T04:24:52.611Z
      loadedUrl: string; //https://example.com
      referralUrl: string; //https://example.com
    };
    debug: {
      requestHandlerMode: 'browser';
    };
    metadata: {
      author: string;
      canonicalUrl: string;
      description: string;
      //headers
    };
    screenshotUrl: null | string;
    text: string;
    url: string;
  },
];

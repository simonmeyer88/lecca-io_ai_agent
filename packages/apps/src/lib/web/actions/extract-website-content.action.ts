import {
  createAction,
  createMarkdownField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

export const extractWebsiteContent = createAction({
  id: 'web_action_extract-website-content',
  name: 'Extract Website Content',
  description: 'Visits a website and extracts the text content',
  iconUrl: `https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/web.svg`,
  inputConfig: [
    createTextInputField({
      id: 'url',
      label: 'URL',
      description: 'The URL of the website to visit',
      placeholder: 'Add URL',
      required: {
        missingMessage: 'Please enter a URL',
        missingStatus: 'warning',
      },
    }),
    createMarkdownField({
      id: 'markdown',
      markdown:
        'If the website is static, use the "Extract Static Website Content" action instead. If the website loads dynamic data using Javascript, then use this action.',
    }),
    createMarkdownField({
      id: 'markdown2',
      markdown:
        'Note that this action uses credits per run. The amount depends on the duration of the process.',
    }),
  ],

  aiSchema: z.object({
    url: z.string().describe('The URL of the website to visit'),
  }),

  run: async ({
    configValue,
    workspaceId,
    projectId,
    agentId,
    executionId,
    workflowId,
    credits,
    http,
  }) => {
    const { url } = configValue;

    await credits.checkIfWorkspaceHasEnoughCredits({
      workspaceId,
      usageType: 'extract-dynamic-website-content',
    });

    const taskUrl = `https://api.apify.com/v2/actor-tasks/${process.env.APIFY_EXTRACT_DYNAMIC_CONTENT_TASK_ID}/runs?timeout=60&waitForFinish=60`;

    let urlToSearch = url;
    if (
      !urlToSearch.startsWith('http://') &&
      !urlToSearch.startsWith('https://')
    ) {
      urlToSearch = `https://${urlToSearch}`;
    }

    const runSyncResponse = (await http.request({
      method: 'POST',
      url: taskUrl,
      data: {
        startUrls: [{ url: urlToSearch }],
      },
      headers: {
        Authorization: `Bearer ${process.env.APIFY_API_KEY}`,
      },
      workspaceId,
    })) as { data: { data: RunSyncResponse } };

    const datasetId = runSyncResponse.data?.data?.defaultDatasetId;

    if (!datasetId) {
      throw new Error('Web search ran, but no data was returned.');
    }

    const datasetUrl = `https://api.apify.com/v2/datasets/${datasetId}/items`;

    const datasetItemResponse = (await http.request({
      method: 'GET',
      url: datasetUrl,
      headers: {
        Authorization: `Bearer ${process.env.APIFY_API_KEY}`,
      },
      workspaceId,
    })) as { data: DatasetItemResponse };

    const items = datasetItemResponse.data;
    const firstItem = items[0];
    const text = firstItem.text ?? '';

    const calculatedCreditsFromToken = credits.transformCostToCredits({
      usageType: 'extract-dynamic-website-content',
      data: {
        cost: runSyncResponse.data.data.usageTotalUsd,
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
          actionId: 'web_action_extract-website-content',
        },
      },
    });

    return {
      url: firstItem.url,
      text,
      creditUsage,
    };
  },

  mockRun: async () => {
    return {
      url: 'https://example.com',
      text: 'The content of the website in text format will be here',
    };
  },
});

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
      httpStatusCode: number;
      loadedTime: string;
      loadedUrl: string;
      referralUrl: string;
    };
    debug: {
      requestHandlerMode: 'browser';
    };
    metadata: {
      author: string;
      canonicalUrl: string;
      description: string;
    };
    screenshotUrl: null | string;
    text: string;
    url: string;
  },
];

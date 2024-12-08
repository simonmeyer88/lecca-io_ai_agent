import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Dropbox } from '../dropbox.app';

export class DropboxSearch extends Action {
  app: Dropbox;
  id = 'dropbox_action_search';
  name = 'Search';
  description = 'Search for files and folders in Dropbox';
  aiSchema = z.object({
    query: z
      .string()
      .min(1)
      .describe('The search query to find files or folders'),
    path: z
      .string()
      .optional()
      .describe('The folder path to limit the search to'),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'query',
      label: 'Search Query',
      description: 'The search query to find files or folders',
      inputType: 'text',
      placeholder: 'Enter search query',
      required: {
        missingMessage: 'Search query is required',
        missingStatus: 'warning',
      },
    },
    this.app.dynamicListFolders(),
  ];

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
    const url = 'https://api.dropboxapi.com/2/files/search_v2';

    // Building the request payload
    const data = {
      query: configValue.query,
      options: {
        path: configValue.path || '',
        max_results: 100,
        mode: 'filename',
      },
    };

    const result = await this.app.http.loggedRequest({
      method: 'POST',
      url,
      data,
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
      },
      workspaceId,
    });

    if (result?.data) {
      return result.data;
    } else {
      throw new Error(`Failed to search: ${result.data?.error_summary}`);
    }
  }

  async mockRun(): Promise<Response> {
    return {
      matches: [
        {
          metadata: {
            name: 'Example File.txt',
            path_lower: '/example file.txt',
            path_display: '/Example File.txt',
          },
          match_type: 'filename',
        },
      ],
    };
  }
}

type ConfigValue = z.infer<DropboxSearch['aiSchema']>;

type Response = {
  matches: Array<{
    metadata: {
      name: string;
      path_lower: string;
      path_display: string;
      [key: string]: any;
    };
    match_type: string;
  }>;
};

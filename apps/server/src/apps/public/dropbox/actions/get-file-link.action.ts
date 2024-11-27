import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Dropbox } from '../dropbox.app';

export class GetTemporaryLink extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Dropbox;

  id = 'dropbox_action_get-temporary-link';
  name = 'Get Temporary Link';
  description = 'Retrieves a temporary link to a Dropbox file';
  aiSchema = z.object({
    path: z.string().min(1).describe('The path of the file in Dropbox'),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'path',
      label: 'File Path',
      description: 'The path to the file in your Dropbox',
      inputType: 'text',
      placeholder: '/path/to/file',
      required: {
        missingMessage: 'File path is required',
        missingStatus: 'warning',
      },
    },
  ];

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
    const url = 'https://api.dropboxapi.com/2/files/get_temporary_link';

    const body = {
      path: configValue.path,
    };

    const result = await this.app.http.loggedRequest({
      method: 'POST',
      url,
      data: body,
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
      },
      workspaceId,
    });

    if (result?.data?.link) {
      return result.data;
    } else {
      throw new Error(
        `Failed to get temporary link: ${result.data?.error_summary}`,
      );
    }
  }

  async mockRun(): Promise<Response> {
    return {
      link: 'https://www.dropbox.com/s/abc123/temporary-link?dl=0',
      metadata: {
        name: 'file_name.txt',
        path_lower: '/path/to/file_name.txt',
        path_display: '/path/to/file_name.txt',
        id: 'id:abc123',
      },
    };
  }
}

type ConfigValue = z.infer<GetTemporaryLink['aiSchema']>;

type Response = {
  link: string;
  metadata: {
    name: string;
    path_lower: string;
    path_display: string;
    id: string;
  };
};

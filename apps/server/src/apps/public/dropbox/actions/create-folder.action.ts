import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Dropbox } from '../dropbox.app';

export class DropboxCreateFolder extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Dropbox;

  id = 'dropbox_action_create-folder';
  name = 'Create Folder';
  description = 'Creates a folder in Dropbox';
  aiSchema = z.object({
    folderName: z.string().min(1).describe('The name of the folder to create'),
    parentFolderPath: z
      .string()
      .nullable()
      .optional()
      .describe(
        'The path of the parent folder where the new folder will be created. Leave empty if you want to create the folder in the root directory',
      ),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'folderName',
      label: 'Folder Name',
      description: 'Name of the folder to create',
      inputType: 'text',
      placeholder: 'Enter folder name',
      required: {
        missingMessage: 'Folder name is required',
        missingStatus: 'warning',
      },
    },
    {
      ...this.app.dynamicListFolders(),
      id: 'parentFolderPath',
      label: 'Parent Folder Path',
      placeholder: 'Enter parent folder path (optional)',
      description:
        'Path of the parent folder. Leave empty to create in root directory',
    },
  ];

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
    const url = 'https://api.dropboxapi.com/2/files/create_folder_v2';

    const data = {
      path: `${configValue.parentFolderPath || ''}/${configValue.folderName}`,
      autorename: false,
    };

    const result = await this.app.http.loggedRequest({
      method: 'POST',
      url,
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
      },
      data,
      workspaceId,
    });

    if (result?.data?.metadata) {
      return result.data;
    } else {
      throw new Error(`Failed to create folder: ${result.data?.error_summary}`);
    }
  }

  async mockRun(): Promise<Response> {
    return {
      metadata: {
        name: 'New Folder',
        path_lower: '/new folder',
        path_display: '/New Folder',
        id: 'id:newfolder',
      },
    };
  }
}

type ConfigValue = z.infer<DropboxCreateFolder['aiSchema']>;

type Response = {
  metadata: {
    name: string;
    path_lower: string;
    path_display: string;
    id: string;
  };
};

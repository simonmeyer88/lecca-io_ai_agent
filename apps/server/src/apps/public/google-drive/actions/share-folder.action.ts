import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { GoogleDrive } from '../google-drive.app';
import { GoogleDriveShareFolderType } from '../types/google-drive.type';

export class ShareFolder extends Action {
  app: GoogleDrive;
  id = 'google-drive_action_share-folder';
  name = 'Share Folder';
  description = `Share a folder that ${ServerConfig.PLATFORM_NAME} has created.`;
  aiSchema = z.object({
    folder: z.string().min(1).describe('The ID of the folder to share'),
    role: z
      .enum(['writer', 'commenter', 'reader'])
      .describe('The role of the user'),
    email: z.string().email().min(1).describe('The email of the user'),
  });
  inputConfig: InputConfig[] = [
    {
      ...this.app.dynamicSelectFolder(),
      selectOptions: undefined, //So that root isn't included
      defaultValue: undefined,
      description: 'Select a folder to share',
    },
    {
      id: 'role',
      label: 'Role',
      description: 'The role of the user',
      inputType: 'select',
      placeholder: 'Select a role',
      selectOptions: [
        {
          label: 'Writer',
          value: 'writer',
        },
        {
          label: 'Commenter',
          value: 'commenter',
        },
        {
          label: 'Reader',
          value: 'reader',
        },
      ],
      required: {
        missingMessage: 'Content is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'email',
      label: 'Email',
      description: 'The email address of the user',
      inputType: 'text',
      placeholder: 'Enter email',
      required: {
        missingMessage: 'Email is required',
        missingStatus: 'warning',
      },
    },
  ];

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<GoogleDriveShareFolderType> {
    const googleDrive = await this.app.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { folder, role, email } = configValue;

    await googleDrive.permissions.create({
      fileId: folder,
      requestBody: {
        role: role,
        type: 'user',
        emailAddress: email,
      },
    });

    return {
      folderId: folder,
      role: role,
      emailAddress: email,
    };
  }

  async mockRun(): Promise<GoogleDriveShareFolderType> {
    return {
      folderId: 'mock-folder-id',
      role: 'commenter',
      emailAddress: 'example@test.com',
    };
  }
}

type ConfigValue = z.infer<ShareFolder['aiSchema']>;

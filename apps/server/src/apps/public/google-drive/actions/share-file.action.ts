import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { GoogleDrive } from '../google-drive.app';
import { GoogleDriveShareFileType } from '../types/google-drive.type';

export class ShareFile extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleDrive;
  id() {
    return 'google-drive_action_share-file';
  }
  name() {
    return 'Share File';
  }
  description() {
    return `Share a file that ${ServerConfig.PLATFORM_NAME} has created.`;
  }
  aiSchema() {
    return z.object({
      file: z.string().min(1).describe('The ID of the file to share'),
      role: z
        .enum(['writer', 'commenter', 'reader'])
        .describe('The role of the user'),
      email: z.string().email().min(1).describe('The email of the user'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        ...this.app.dynamicSelectFile(),
        description: 'Select a file to share',
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
  }

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<GoogleDriveShareFileType> {
    const googleDrive = await this.app.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { file, role, email } = configValue;

    await googleDrive.permissions.create({
      fileId: file,
      requestBody: {
        role: role,
        type: 'user',
        emailAddress: email,
      },
    });

    return {
      fileId: file,
      role: role,
      emailAddress: email,
    };
  }

  async mockRun(): Promise<GoogleDriveShareFileType> {
    return {
      fileId: 'mock-file-id',
      role: 'commenter',
      emailAddress: 'example@test.com',
    };
  }
}

type ConfigValue = z.infer<ReturnType<ShareFile['aiSchema']>>;

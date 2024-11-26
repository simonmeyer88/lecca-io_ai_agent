import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { GoogleDrive } from '../google-drive.app';
import { GoogleDriveFileDeleteResponseType } from '../types/google-drive.type';

export class DeleteFile extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleDrive;
  id() {
    return 'google-drive_action_delete-file';
  }
  name() {
    return 'Delete File';
  }
  description() {
    return `Delete a file created by ${ServerConfig.PLATFORM_NAME}.`;
  }
  aiSchema() {
    return z.object({
      file: z.string().min(1).describe('The ID of the file to delete'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        id: 'markdown',
        inputType: 'markdown',
        label: '',
        description: '',
        markdown: `You will only be able to delete files that were created by ${ServerConfig.PLATFORM_NAME}.`,
      },
      {
        ...this.app.dynamicSelectFile(),
        description: 'Select the file to delete.',
      },
    ];
  }

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<GoogleDriveFileDeleteResponseType> {
    const googleDrive = await this.app.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { file } = configValue;

    await googleDrive.files.delete({
      fileId: file,
    });

    return {
      fileId: file,
    };
  }

  async mockRun(): Promise<GoogleDriveFileDeleteResponseType> {
    return {
      fileId: 'mock-file-id',
    };
  }
}

type ConfigValue = z.infer<ReturnType<DeleteFile['aiSchema']>>;

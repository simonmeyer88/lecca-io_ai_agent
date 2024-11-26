import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { GoogleDrive } from '../google-drive.app';

export class MoveFile extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleDrive;
  id() {
    return 'google-drive_action_move-file';
  }
  name() {
    return 'Move File';
  }
  description() {
    return `Moves a file created by ${ServerConfig.PLATFORM_NAME} into a designated folder.`;
  }
  aiSchema() {
    return z.object({
      file: z.string().min(1).describe('The ID of the file to move'),
      folder: z
        .string()
        .min(1)
        .describe('The ID of the folder where the file will be moved to'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        ...this.app.dynamicSelectFile(),
        label: 'File to Move',
        description: '',
      },
      {
        ...this.app.dynamicSelectFolder(),
        label: 'File Destination',
        description: 'Select the folder where the file will be moved to.',
      },
    ];
  }

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
    const googleDrive = await this.app.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { file, folder } = configValue;

    const fileBeingMoved = await googleDrive.files.get({
      fileId: file,
      fields: 'id, name, parents',
    });

    //Move a file into a designated folder
    const response = await googleDrive.files.update({
      fileId: file,
      addParents: folder,
      removeParents: fileBeingMoved.data.parents?.join(','),
    });

    return {
      id: response.data.id,
      fileName: response.data.name,
      folderId: folder,
    };
  }

  async mockRun(): Promise<Response> {
    return {
      id: 'mock-file-id',
      fileName: 'Mock File Name',
      folderId: 'mock-folder-id',
    };
  }
}

type Response = {
  id: string;
  fileName: string;
  folderId: string;
};

type ConfigValue = z.infer<ReturnType<MoveFile['aiSchema']>>;

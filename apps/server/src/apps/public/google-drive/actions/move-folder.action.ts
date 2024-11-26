import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { GoogleDrive } from '../google-drive.app';

export class MoveFolder extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleDrive;
  id() {
    return 'google-drive_action_move-folder';
  }
  name() {
    return 'Move Folder';
  }
  description() {
    return `Moves a folder created by ${ServerConfig.PLATFORM_NAME} into another folder.`;
  }
  aiSchema() {
    return z.object({
      'folder-to-move': z
        .string()
        .min(1)
        .describe('The ID of the folder to move'),
      'target-folder': z
        .string()
        .min(1)
        .describe('The ID of the folder where the folder will be moved to'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        ...this.app.dynamicSelectFolder(),
        id: 'folder-to-move',
        label: 'Folder to Move',
        selectOptions: undefined, //Beause we can't move root, so lets not include that option
        defaultValue: undefined,
        description: '',
      },
      {
        ...this.app.dynamicSelectFolder(),
        id: 'target-folder',
        label: 'Folder Destination',
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

    const folderToMove = configValue['folder-to-move'];
    const targetFolder = configValue['target-folder'];

    if (folderToMove === targetFolder) {
      throw new Error('Cannot move a folder into itself.');
    }

    const fileBeingMoved = await googleDrive.files.get({
      fileId: folderToMove,
      fields: 'id, name, parents',
    });

    //Move a folder into a designated folder
    const response = await googleDrive.files.update({
      fileId: folderToMove,
      addParents: targetFolder,
      removeParents: fileBeingMoved.data.parents?.join(','),
    });

    return {
      folderId: response.data.id,
      folderName: response.data.name,
      targetFolderId: targetFolder,
    };
  }

  async mockRun(): Promise<Response> {
    return {
      folderId: 'mock-folder-id',
      folderName: 'Mock Folder Name',
      targetFolderId: 'mock-target-folder-id',
    };
  }
}

type Response = {
  folderId: string;
  folderName: string;
  targetFolderId: string;
};

type ConfigValue = z.infer<ReturnType<MoveFolder['aiSchema']>>;

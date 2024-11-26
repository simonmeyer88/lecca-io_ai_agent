import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { GoogleDrive } from '../google-drive.app';
import { GoogleDriveCopyFileResponseType } from '../types/google-drive.type';

export class CopyFile extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleDrive;
  id() {
    return 'google-drive_action_copy-file';
  }
  name() {
    return 'Copy File';
  }
  description() {
    return 'Copies a file into a designated folder.';
  }
  aiSchema() {
    return z.object({
      file: z.string().min(1).describe('The ID of the file to copy'),
      'file-name': z.string().min(1).describe('The name of the copied file'),
      'parent-folder': z
        .string()
        .nullable()
        .optional()
        .describe('The ID of the folder where the new document will be saved'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        ...this.app.dynamicSelectFile(),
        label: 'File to Copy',
        description: 'File to copy',
      },
      {
        ...this.app.dynamicSelectFolder(),
        id: 'parent-folder',
        label: 'Target Folder',
        description: 'Select the folder where the new document will be saved.',
      },
      {
        id: 'file-name',
        label: 'File Name',
        description: 'The name of the copied file.',
        inputType: 'text',
        placeholder: 'Add a file name',
        required: {
          missingMessage: 'File Name is required',
          missingStatus: 'warning',
        },
      },
    ];
  }

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<GoogleDriveCopyFileResponseType> {
    const googleDrive = await this.app.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const fileToCopyId = configValue['file'];
    const fileName = configValue['file-name'];
    const parentFolder = configValue['parent-folder'];

    //Copies a file into a designated folder
    const newFile = await googleDrive.files.copy({
      fileId: fileToCopyId,
      requestBody: {
        name: fileName,
        parents: parentFolder && parentFolder != 'root' ? [parentFolder] : [],
      },
      supportsAllDrives: true,
    });

    return {
      id: newFile.data.id,
      newFileName: newFile.data.name,
      webViewLink: newFile.data.webViewLink,
      createdTime: newFile.data.createdTime,
    };
  }

  async mockRun(): Promise<GoogleDriveCopyFileResponseType> {
    return {
      id: 'mock-file-id',
      newFileName: 'Mock File Name',
      webViewLink: 'https://example.com',
      createdTime: new Date().toISOString(),
    };
  }
}

type ConfigValue = z.infer<ReturnType<CopyFile['aiSchema']>>;

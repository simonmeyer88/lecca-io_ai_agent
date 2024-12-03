import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { GoogleDrive } from '../google-drive.app';
import { GoogleDriveFolderType } from '../types/google-drive.type';

export class CreateFolder extends Action {
  app: GoogleDrive;
  id = 'google-drive_action_create-folder';
  name = 'New Folder';
  description = 'Creates a new folder.';
  aiSchema = z.object({
    'folder-name': z.string().min(1).describe('The name of the new folder'),
    'parent-folder': z
      .string()
      .nullable()
      .optional()
      .describe(
        'The ID of the parent folder where the new folder will be saved',
      ),
  });
  inputConfig: InputConfig[] = [
    {
      ...this.app.dynamicSelectFolder(),
      id: 'parent-folder',
      label: 'Parent Folder',
      description: 'Select where to create this new folder.',
    },
    {
      id: 'folder-name',
      label: 'Folder Name',
      description: 'The name of the new folder.',
      inputType: 'text',
      placeholder: 'Add a folder name',
      required: {
        missingMessage: 'Folder Name is required',
        missingStatus: 'warning',
      },
    },
  ];

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<GoogleDriveFolderType> {
    const googleDrive = await this.app.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const folderName = configValue['folder-name'];
    const parentFolder = configValue['parent-folder'];

    // Create a new folder
    const newFolder = await googleDrive.files.create({
      requestBody: {
        name: folderName,
        mimeType: 'application/vnd.google-apps.folder',
        parents: parentFolder && parentFolder != 'root' ? [parentFolder] : [],
      },
      supportsAllDrives: true,
      fields: 'id, name, webViewLink, createdTime',
    });

    return {
      id: newFolder.data.id,
      name: newFolder.data.name,
      webViewLink: newFolder.data.webViewLink,
      createdTime: newFolder.data.createdTime,
    };
  }

  async mockRun(): Promise<GoogleDriveFolderType> {
    return {
      id: 'mock-folder-id',
      name: 'Mock Folder',
      webViewLink: 'https://example.com',
      createdTime: new Date().toISOString(),
    };
  }
}

type ConfigValue = z.infer<CreateFolder['aiSchema']>;

import { InputConfig } from '@/apps/lib/input-config';
import { RunTriggerArgs, TimeBasedPollTrigger } from '@/apps/lib/trigger';
import { dateStringToMilliOrNull } from '@/apps/utils/date-string-to-milli-or-null';

import { GoogleDrive } from '../google-drive.app';
import { GoogleDriveFilePollType } from '../types/google-drive.type';

export class NewFileInFolder extends TimeBasedPollTrigger {
  app: GoogleDrive;
  id = 'google-drive_trigger_new-file-in-folder';
  name = 'New File in Folder';
  description =
    'Triggers when a new file is created inside selected folder (not subfolders).';
  inputConfig: InputConfig[] = [
    {
      ...this.app.dynamicSelectFolder(),
      description: 'Select the folder to watch for new files',
    },
  ];

  async run({
    connection,
    configValue,
  }: RunTriggerArgs<ConfigValue>): Promise<GoogleDriveFilePollType[]> {
    const googleDrive = await this.app.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    // Search for documents
    const newestFiles = await googleDrive.files.list({
      q: `trashed=false and '${configValue.folder}' in parents`,
      pageSize: 10,
      fields: 'nextPageToken, files(id, name, webViewLink, createdTime)',
      orderBy: 'createdTime desc',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });

    return newestFiles?.data?.files?.map((file) => ({
      createdTime: file.createdTime,
      documentId: file.id,
      title: file.name,
    }));
  }

  async mockRun(): Promise<GoogleDriveFilePollType[]> {
    return [
      {
        documentId: 'mock-file-id',
        title: 'Mock File Title',
        createdTime: new Date().toISOString(),
      },
    ];
  }

  extractTimestampFromResponse({
    response,
  }: {
    response: GoogleDriveFilePollType;
  }) {
    if (response.createdTime) {
      return dateStringToMilliOrNull(response.createdTime);
    } else {
      return null;
    }
  }
}

type ConfigValue = {
  folder: string;
};

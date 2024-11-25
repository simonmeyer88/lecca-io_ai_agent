import { InputConfig } from '@/apps/lib/input-config';
import {
  RunTriggerArgs,
  TimeBasedPollTrigger,
  TriggerConstructorArgs,
} from '@/apps/lib/trigger';
import { DateStringToMilliOrNull } from '@/apps/utils/date-string-to-milli-or-null';
import { GoogleDrive } from '../google-drive.app';
import { GoogleDriveFilePollType } from '../types/google-drive.type';

export class NewFile extends TimeBasedPollTrigger {
  constructor(args: TriggerConstructorArgs) {
    super(args);
  }

  app: GoogleDrive;
  id() {
    return 'google-drive_trigger_new-file';
  }
  name() {
    return 'New File';
  }
  description() {
    return 'Triggers when a new file is created inside any folder';
  }
  inputConfig(): InputConfig[] {
    return [];
  }

  async run({
    connection,
  }: RunTriggerArgs<unknown>): Promise<GoogleDriveFilePollType[]> {
    const googleDrive = await this.app.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    // Search for documents
    const newestFiles = await googleDrive.files.list({
      q: `trashed=false and mimeType != 'application/vnd.google-apps.folder'`,
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
      return DateStringToMilliOrNull(response.createdTime);
    } else {
      return null;
    }
  }
}

import { InputConfig } from '@/apps/lib/input-config';
import {
  RunTriggerArgs,
  TimeBasedPollTrigger,
  TriggerConstructorArgs,
} from '@/apps/lib/trigger';
import { DateStringToMilliOrNull } from '@/apps/utils/date-string-to-milli-or-null';

import { GoogleDocs } from '../google-docs.app';
import { GoogleDocumentInFolderPollType } from '../types/google-docs.type';

export class NewDocumentInFolder extends TimeBasedPollTrigger {
  constructor(args: TriggerConstructorArgs) {
    super(args);
  }

  app: GoogleDocs;
  id = 'google-docs_trigger_new-document-in-folder';
  name = 'New Document in Folder';
  description =
    'Triggers when a new document is created inside selected folder (not subfolders).';
  inputConfig: InputConfig[] = [
    {
      ...this.app.dynamicSelectFolder(),
      description: 'Select the folder to watch for new documents',
    },
  ];

  async run({
    connection,
    configValue,
  }: RunTriggerArgs<ConfigValue>): Promise<GoogleDocumentInFolderPollType[]> {
    const googleDrive = await this.app.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    // Search for documents
    const newestDocuments = await googleDrive.files.list({
      q: `mimeType='application/vnd.google-apps.document' and trashed=false and '${configValue.folder}' in parents`,
      pageSize: 10,
      fields: 'nextPageToken, files(id, name, createdTime)',
      orderBy: 'createdTime desc',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });

    // Fetch the folder name
    const folderResponse = await googleDrive.files.get({
      fileId: configValue.folder,
      fields: 'name',
      supportsAllDrives: true,
    });

    const folderName = folderResponse?.data?.name ?? '';

    return (
      newestDocuments?.data?.files?.map((file) => ({
        documentId: file.id,
        folderId: configValue.folder,
        createdTime: file.createdTime,
        documentTitle: file.name,
        folderTitle: folderName,
      })) ?? []
    );
  }

  async mockRun(): Promise<GoogleDocumentInFolderPollType[]> {
    return [
      {
        documentId: 'mock-document-id',
        folderId: 'mock-folder-id',
        documentTitle: 'Mock Document Title',
        folderTitle: 'Mock Folder Title',
        createdTime: new Date().toISOString(),
      },
    ];
  }

  extractTimestampFromResponse({
    response,
  }: {
    response: GoogleDocumentInFolderPollType;
  }) {
    if (response.createdTime) {
      return DateStringToMilliOrNull(response.createdTime);
    } else {
      return null;
    }
  }
}

type ConfigValue = {
  folder: string;
};

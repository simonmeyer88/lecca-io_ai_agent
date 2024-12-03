import { InputConfig } from '@/apps/lib/input-config';
import { RunTriggerArgs, TimeBasedPollTrigger } from '@/apps/lib/trigger';
import { DateStringToMilliOrNull } from '@/apps/utils/date-string-to-milli-or-null';

import { GoogleDocs } from '../google-docs.app';
import { GoogleDocumentPollType } from '../types/google-docs.type';

export class NewDocument extends TimeBasedPollTrigger {
  app: GoogleDocs;
  id = 'google-docs_trigger_new-document';
  name = 'New Document';
  description = 'Triggers when a new document is created inside any folder';
  inputConfig: InputConfig[] = [];

  async run({
    connection,
  }: RunTriggerArgs<unknown>): Promise<GoogleDocumentPollType[]> {
    const googleDrive = await this.app.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    // Search for documents
    const newestDocuments = await googleDrive.files.list({
      q: `mimeType='application/vnd.google-apps.document' and trashed=false`,
      pageSize: 10,
      fields: 'nextPageToken, files(id, name, webViewLink, createdTime)',
      orderBy: 'createdTime desc',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });

    return newestDocuments?.data?.files?.map((file) => ({
      createdTime: file.createdTime,
      documentId: file.id,
      title: file.name,
    }));
  }

  async mockRun(): Promise<GoogleDocumentPollType[]> {
    return [
      {
        documentId: 'mock-document-id',
        title: 'Mock Document Title',
        createdTime: new Date().toISOString(),
      },
    ];
  }

  extractTimestampFromResponse({
    response,
  }: {
    response: GoogleDocumentPollType;
  }) {
    if (response.createdTime) {
      return DateStringToMilliOrNull(response.createdTime);
    } else {
      return null;
    }
  }
}

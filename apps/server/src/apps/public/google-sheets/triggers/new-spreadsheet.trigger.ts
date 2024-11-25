import { InputConfig } from '@/apps/lib/input-config';
import {
  RunTriggerArgs,
  TimeBasedPollTrigger,
  TriggerConstructorArgs,
} from '@/apps/lib/trigger';
import { DateStringToMilliOrNull } from '@/apps/utils/date-string-to-milli-or-null';
import { GoogleSheets } from '../google-sheets.app';
import { GoogleSheetsPollType } from '../types/google-sheets.type';

export class NewSpreadsheet extends TimeBasedPollTrigger {
  constructor(args: TriggerConstructorArgs) {
    super(args);
  }

  app: GoogleSheets;
  id() {
    return 'google-sheets_trigger_new-spreadsheet';
  }
  name() {
    return 'New Spreadsheet';
  }
  description() {
    return 'Triggers when a new spreadsheet is created inside any folder';
  }
  inputConfig(): InputConfig[] {
    return [];
  }

  async run({
    connection,
  }: RunTriggerArgs<unknown>): Promise<GoogleSheetsPollType[]> {
    const googleDrive = await this.app.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    // Search for documents
    const newestSpreadsheets = await googleDrive.files.list({
      q: `mimeType='application/vnd.google-apps.spreadsheet' and trashed=false`,
      pageSize: 10,
      fields: 'nextPageToken, files(id, name, createdTime)',
      orderBy: 'createdTime desc',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });

    return (
      newestSpreadsheets?.data?.files?.map((file) => ({
        spreadsheetId: file.id,
        createdTime: file.createdTime,
        title: file.name,
      })) ?? []
    );
  }

  async mockRun(): Promise<GoogleSheetsPollType[]> {
    return [
      {
        spreadsheetId: 'mock-spreadsheet-id',
        title: 'Mock Spreadsheet Title',
        createdTime: new Date().toISOString(),
      },
    ];
  }

  extractTimestampFromResponse({
    response,
  }: {
    response: GoogleSheetsPollType;
  }) {
    if (response.createdTime) {
      return DateStringToMilliOrNull(response.createdTime);
    } else {
      return null;
    }
  }
}

import { InputConfig } from '@/apps/lib/input-config';
import {
  ItemBasedPollTrigger,
  RunTriggerArgs,
  TriggerConstructorArgs,
} from '@/apps/lib/trigger';
import { GoogleSheets } from '../google-sheets.app';
import { GoogleSheetsWorksheetPollType } from '../types/google-sheets.type';

export class NewSheet extends ItemBasedPollTrigger {
  constructor(args: TriggerConstructorArgs) {
    super(args);
  }

  app: GoogleSheets;
  id() {
    return 'google-sheets_trigger_new-sheet';
  }
  name() {
    return 'New Sheet';
  }
  description() {
    return 'Triggers when a new sheet is created in a spreadsheet. New sheet must be at the end of the list of sheets in the spreadsheet.';
  }
  inputConfig(): InputConfig[] {
    return [
      {
        ...this.app.dynamicSelectSpreadSheets(),
        description: 'Select the spreadsheet to monitor for new sheets',
      },
    ];
  }

  async run({
    connection,
    configValue,
  }: RunTriggerArgs<ConfigValue>): Promise<GoogleSheetsWorksheetPollType[]> {
    const googleSheets = await this.app.googleSheets({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { spreadsheet } = configValue;

    // Search for new sheets in a spreadsheet
    const newestSheets = await googleSheets.spreadsheets.get({
      spreadsheetId: spreadsheet,
      fields: 'sheets.properties',
    });

    //Return in reverse order so that the newest sheet is first
    return (
      newestSheets?.data?.sheets
        ?.map((sheet) => ({
          spreadsheetId: spreadsheet,
          sheetId: sheet.properties?.sheetId?.toString(),
          sheetTitle: sheet.properties?.title,
        }))
        ?.reverse() ?? []
    );
  }

  async mockRun(): Promise<GoogleSheetsWorksheetPollType[]> {
    return [
      {
        spreadsheetId: 'mock-sheet-id',
        sheetId: 'mock-sheet-id',
        sheetTitle: 'Mock Sheet Title',
      },
    ];
  }

  extractItemIdentifierFromResponse(args: {
    response: GoogleSheetsWorksheetPollType;
  }): string {
    return args.response.sheetId;
  }
}

type ConfigValue = {
  spreadsheet: string;
};

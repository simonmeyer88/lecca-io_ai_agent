import { InputConfig } from '@/apps/lib/input-config';
import {
  LengthBasedPollTrigger,
  RunTriggerArgs,
  TriggerConstructorArgs,
} from '@/apps/lib/trigger';
import { GoogleSheets } from '../google-sheets.app';

export class NewRowAdded extends LengthBasedPollTrigger {
  constructor(args: TriggerConstructorArgs) {
    super(args);
  }

  app: GoogleSheets;
  id() {
    return 'google-sheets_trigger_new-row-added';
  }
  name() {
    return 'New Row Added';
  }
  description() {
    return 'Triggers when a new row is added to a specified sheet in a Google Spreadsheet.';
  }
  inputConfig(): InputConfig[] {
    return [
      this.app.dynamicSelectSpreadSheets(),
      this.app.dynamicSelectSheetNames(),
    ];
  }
  async run({
    connection,
    configValue,
  }: RunTriggerArgs<ConfigValue>): Promise<GoogleSheetsRowType[]> {
    const googleSheets = await this.app.googleSheets({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { spreadsheet, sheet } = configValue;

    const response = await googleSheets.spreadsheets.values.get({
      spreadsheetId: spreadsheet,
      range: sheet,
    });

    const rows = response.data.values || [];

    return rows;
  }

  async mockRun(): Promise<GoogleSheetsRowType[]> {
    return [['Row Item 1', 'Row Item 2']];
  }
}

type ConfigValue = {
  spreadsheet: string;
  sheet: string;
  headerRowNumber: number;
};

type GoogleSheetsRowType = string[];

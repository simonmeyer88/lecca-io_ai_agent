import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { GoogleSheets } from '../google-sheets.app';

export class ListSheets extends Action {
  app: GoogleSheets;

  id = 'google-sheets_action_list-sheets';
  name = 'List Sheets';
  description =
    'Lists all sheets available within a specific Google Spreadsheet.';
  aiSchema = z.object({
    spreadsheet: z.string().describe('Spreadsheet ID is required'),
  });
  inputConfig: InputConfig[] = [this.app.dynamicSelectSpreadSheets()];

  async run({
    connection,
    configValue,
  }: RunActionArgs<ConfigValue>): Promise<Sheet[]> {
    const sheets = await this.app.googleSheets({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    // Get all sheets from a specific spreadsheet
    const response = await sheets.spreadsheets.get({
      spreadsheetId: configValue.spreadsheet,
    });

    return (
      response.data.sheets?.map((sheet) => ({
        id: sheet.properties?.sheetId?.toString(),
        name: sheet.properties?.title,
      })) ?? []
    );
  }

  async mockRun(): Promise<Sheet[]> {
    return [
      {
        id: '1',
        name: 'Mock Sheet 1',
      },
      {
        id: '2',
        name: 'Mock Sheet 2',
      },
    ];
  }
}

type ConfigValue = z.infer<ListSheets['aiSchema']>;
type Sheet = {
  id: string;
  name: string;
};

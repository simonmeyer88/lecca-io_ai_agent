import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { GoogleSheets } from '../google-sheets.app';
import { z } from 'zod';

export class AddRowToSheet extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleSheets;

  id() {
    return 'google-sheets_action_add-row-to-sheet';
  }

  name() {
    return 'Add Row to Sheet';
  }

  description() {
    return 'Adds a new row to the specified sheet.';
  }

  aiSchema() {
    return z.object({
      spreadsheet: z.string().min(1).describe('The ID of the spreadsheet'),
      sheet: z.string().min(1).describe('The name of the sheet'),
      headerRowNumber: z
        .number()
        .describe('The row number the header columns are located on.'),
      mappings: z
        .array(
          z.object({
            key: z.string().min(1).nullable().optional().describe('Not used'),
            value: z.string().min(1).describe('the value to enter in the cell'),
          }),
        )
        .describe('An array of values to add to the new row.'),
    });
  }

  inputConfig(): InputConfig[] {
    return [
      this.app.dynamicSelectSpreadSheets(),
      this.app.dynamicSelectSheetNames(),
      this.app.headerRowNumber(),
      this.app.dynamicSelectHeadersMap(),
    ];
  }

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
    const sheets = await this.app.googleSheets({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { spreadsheet, sheet, mappings } = configValue;

    // Fetch the data in the sheet to determine the number of rows
    const sheetData = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheet,
      range: `${sheet}`,
    });

    const numRows = sheetData.data.values ? sheetData.data.values.length : 0;

    const insertPosition = numRows + 1;

    // Insert row into the specified position
    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheet,
      range: `${sheet}!A${insertPosition}`,
      valueInputOption: 'RAW',
      requestBody: {
        majorDimension: 'ROWS',
        values: [mappings.map((mapping) => mapping.value)],
      },
    });

    const data = response.data;

    return {
      spreadsheetId: data.spreadsheetId,
      updatedCells: data.updatedCells,
      updatedColumns: data.updatedColumns,
      updatedRange: data.updatedRange,
      updatedRows: data.updatedRows,
    };
  }

  async mockRun(): Promise<Response> {
    return mock;
  }
}

const mock = {
  spreadsheetId: 'some-spreadsheet-id',
  updatedCells: 3,
  updatedColumns: 3,
  updatedRange: 'Sheet2!A2:C2',
  updatedRows: 1,
};

type Response = typeof mock;

type ConfigValue = z.infer<ReturnType<AddRowToSheet['aiSchema']>>;

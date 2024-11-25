import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { GoogleSheets } from '../google-sheets.app';
import { z } from 'zod';

export class LookupSpreadsheetRow extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleSheets;

  id() {
    return 'google-sheets_action_lookup-spreadsheet-row';
  }

  name() {
    return 'Lookup Spreadsheet Row';
  }

  description() {
    return 'Finds a row by its column and value. Returns the first matching row found.';
  }

  aiSchema() {
    return z.object({
      spreadsheet: z.string().min(1).describe('The ID of the spreadsheet'),
      sheet: z.string().min(1).describe('The name of the sheet'),
      column: z.string().min(1).describe('The column index to search'),
      queryValue: z
        .string()
        .min(1)
        .describe('The value to search for in the column'),
      bottomUp: z
        .enum(['yes', 'no'])
        .nullable()
        .optional()
        .default('no')
        .describe('Search for the first result from the bottom up'),
    });
  }

  inputConfig(): InputConfig[] {
    return [
      this.app.dynamicSelectSpreadSheets(),
      this.app.dynamicSelectSheetNames(),
      {
        ...this.app.dynamicSelectColumnsDropdown(),
        label: 'Lookup Column',
        description: 'The column index to search for the value',
      },
      {
        id: 'queryValue',
        label: 'Query Value',
        description: 'The value to search for in the column',
        inputType: 'text',
        placeholder: 'Enter the value to search for',
        required: {
          missingMessage: 'Query value is required',
          missingStatus: 'warning',
        },
      },
      {
        id: 'bottomUp',
        label: 'Bottom Up',
        description: 'Search for the first result from the bottom up',
        inputType: 'select',
        selectOptions: [
          {
            label: 'Yes',
            value: 'yes',
          },
          {
            label: 'No',
            value: 'no',
          },
        ],
        defaultValue: 'no',
      },
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

    const { spreadsheet, sheet, column, queryValue, bottomUp } = configValue;

    // Fetch all data from the specified sheet
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheet,
      range: sheet,
    });

    // Get the data as a 2D array
    const rows = response.data.values || [];

    if (rows.length === 0) {
      // No data found
      return {
        spreadsheetId: spreadsheet,
        sheetName: sheet,
        matchedRow: null,
        rowFound: false,
      };
    }

    const colIndex = Number(column);

    // Helper function to find the first matched row
    const findMatchedRow = (
      rows: string[][],
      queryValue: string,
      colIndex: number,
      bottomUp: boolean,
    ) => {
      const length = rows.length;
      if (bottomUp) {
        for (let i = length - 1; i >= 1; i--) {
          // Start from the last row to the first data row
          if (String(rows[i][colIndex]) === String(queryValue)) {
            return { rowData: rows[i], rowIndex: i + 1 }; // Google Sheets API uses 1-based indexing
          }
        }
      } else {
        for (let i = 1; i < length; i++) {
          // Start from the second row to the last
          if (String(rows[i][colIndex]) === String(queryValue)) {
            return { rowData: rows[i], rowIndex: i + 1 }; // Google Sheets API uses 1-based indexing
          }
        }
      }
      return null; // No match found
    };

    // Find the matched row
    const matched = findMatchedRow(
      rows,
      queryValue,
      colIndex,
      bottomUp === 'yes',
    );

    if (!matched) {
      return { matchedRow: null, rowFound: false };
    }

    const { rowData, rowIndex } = matched;

    return {
      spreadsheetId: spreadsheet,
      sheetName: sheet,
      matchedRow: rowData,
      rowIndex,
      matchedCellAddress: `${this.app.getColumnLetter(colIndex)}${rowIndex}`,
      range: `${sheet}!A${rowIndex}:${this.app.getColumnLetter(rows[0].length - 1)}${rowIndex}`,
      rowFound: true,
    };
  }

  async mockRun(): Promise<Response> {
    return mock;
  }
}

const mock = {
  spreadsheetId: 'some-spreadsheet-id',
  sheetName: 'Sheet1',
  matchedRow: ['value1', 'value2', 'value3'],
  rowIndex: 2,
  matchedCellAddress: 'Sheet1!A2',
  range: 'Sheet1!A2:C2',
  rowFound: true,
};

type Response =
  | typeof mock
  | {
      matchedRow: null;
      rowFound: boolean;
    };

type ConfigValue = z.infer<ReturnType<LookupSpreadsheetRow['aiSchema']>>;

import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-sheets.shared';

export const lookupSpreadsheetRow = createAction({
  id: 'google-sheets_action_lookup-spreadsheet-row',
  name: 'Lookup Spreadsheet Row',
  description:
    'Finds a row by its column and value. Returns the first matching row found.',
  inputConfig: [
    shared.fields.dynamicSelectSpreadSheets,
    shared.fields.dynamicSelectSheetNames,
    {
      ...shared.fields.dynamicSelectColumnsDropdown,
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
  ],
  aiSchema: z.object({
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
  }),
  run: async ({ configValue, connection }) => {
    const sheets = shared.googleSheets({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { spreadsheet, sheet, column, queryValue, bottomUp } = configValue;

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheet,
      range: sheet,
    });

    const rows = response.data.values || [];

    if (rows.length === 0) {
      return {
        spreadsheetId: spreadsheet,
        sheetName: sheet,
        matchedRow: null,
        rowFound: false,
      };
    }

    const colIndex = Number(column);

    const findMatchedRow = (
      rows: string[][],
      queryValue: string,
      colIndex: number,
      bottomUp: boolean,
    ) => {
      const length = rows.length;
      if (bottomUp) {
        for (let i = length - 1; i >= 1; i--) {
          if (String(rows[i][colIndex]) === String(queryValue)) {
            return { rowData: rows[i], rowIndex: i + 1 };
          }
        }
      } else {
        for (let i = 1; i < length; i++) {
          if (String(rows[i][colIndex]) === String(queryValue)) {
            return { rowData: rows[i], rowIndex: i + 1 };
          }
        }
      }
      return null;
    };

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
      matchedCellAddress: `${shared.getColumnLetter(colIndex)}${rowIndex}`,
      range: `${sheet}!A${rowIndex}:${shared.getColumnLetter(rows[0].length - 1)}${rowIndex}`,
      rowFound: true,
    };
  },
  mockRun: async () => ({
    spreadsheetId: 'some-spreadsheet-id',
    sheetName: 'Sheet1',
    matchedRow: ['value1', 'value2', 'value3'],
    rowIndex: 2,
    matchedCellAddress: 'Sheet1!A2',
    range: 'Sheet1!A2:C2',
    rowFound: true,
  }),
});

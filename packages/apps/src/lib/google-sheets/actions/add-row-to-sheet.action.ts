import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-sheets.shared';

export const addRowToSheet = createAction({
  id: 'google-sheets_action_add-row-to-sheet',
  name: 'Add Row to Sheet',
  description: 'Adds a new row to the specified sheet.',
  inputConfig: [
    shared.fields.dynamicSelectSpreadSheets,
    shared.fields.dynamicSelectSheetNames,
    shared.fields.headerRowNumber,
    shared.fields.dynamicSelectHeadersMap,
  ],
  aiSchema: z.object({
    spreadsheet: z.string().describe('The ID of the spreadsheet'),
    sheet: z.string().describe('The name of the sheet'),
    headerRowNumber: z
      .number()
      .describe('The row number the header columns are located on.'),
    mappings: z
      .array(
        z.object({
          key: z.string().nullable().optional().describe('Not used'),
          value: z.string().describe('the value to enter in the cell'),
        }),
      )
      .describe('An array of values to add to the new row.'),
  }),
  run: async ({ configValue, connection }) => {
    const sheets = shared.googleSheets({
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
  },
  mockRun: async () => ({
    spreadsheetId: 'some-spreadsheet-id',
    updatedCells: 3,
    updatedColumns: 3,
    updatedRange: 'Sheet2!A2:C2',
    updatedRows: 1,
  }),
});

import {
  createAction,
  createNumberInputField,
  createSwitchInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-sheets.shared';

export const updateCell = createAction({
  id: 'google-sheets_action_update-cell',
  name: 'Update Cell',
  description: 'Updates a specific cell in the specified sheet.',
  aiSchema: z.object({
    spreadsheet: z.string().min(1).describe('The ID of the spreadsheet'),
    sheet: z.string().min(1).describe('The name of the sheet'),
    cellAddress: z.string().min(1).describe('The cell address, e.g., A1'),
    value: z.string().min(1).describe('The value to set in the cell'),
  }),

  inputConfig: [
    shared.fields.dynamicSelectSpreadSheets,
    shared.fields.dynamicSelectSheetNames,
    createSwitchInputField({
      id: 'useCellAddress',
      label: 'Use Cell Address',
      description: 'Use cell address or enter row index and column',
      switchOptions: {
        checked: 'true',
        unchecked: 'false',
        defaultChecked: true,
      },
    }),
    createTextInputField({
      id: 'cellAddress',
      label: 'Cell',
      description: 'The cell address to update, e.g., A1',
      placeholder: 'Enter cell address, e.g., A1',
      loadOptions: {
        dependsOn: [
          {
            id: 'useCellAddress',
            value: 'true',
          },
        ],
      },
    }),
    {
      ...shared.fields.dynamicSelectColumnsDropdown,
      loadOptions: {
        dependsOn: [
          'spreadsheet',
          'sheet',
          {
            id: 'useCellAddress',
            value: 'false',
          },
        ],
        forceRefresh: true,
      },
      required: undefined,
    },
    createNumberInputField({
      id: 'rowIndex',
      label: 'Row Index',
      description: 'The row index to update',
      numberOptions: {
        min: 1,
        step: 1,
      },
      loadOptions: {
        dependsOn: [
          {
            id: 'useCellAddress',
            value: 'false',
          },
        ],
      },
    }),
    createTextInputField({
      id: 'value',
      label: 'Value',
      description: 'The value to set in the cell',
      placeholder: 'Enter the value to set',
      required: {
        missingMessage: 'Value is required',
        missingStatus: 'warning',
      },
    }),
  ],

  run: async ({ configValue, connection }) => {
    const sheets = await shared.googleSheets({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { spreadsheet, sheet, cellAddress, value } = configValue;

    //These are extra values not available via the AI schema
    const { rowIndex, column, useCellAddress } = configValue as {
      rowIndex: number;
      column: number;
      useCellAddress: string;
    };

    if (useCellAddress === 'false' && !column) {
      throw new Error('Column is required when not using cell address');
    } else if (useCellAddress === 'false' && !rowIndex) {
      throw new Error('Row index is required when not using cell address');
    } else if (useCellAddress === 'true' && !cellAddress) {
      throw new Error('Cell address is required when using cell address');
    }

    const calculatedCellAddress =
      useCellAddress === 'true'
        ? cellAddress
        : `${shared.getColumnLetter(column)}${rowIndex}`;

    const response = await sheets.spreadsheets.values.update({
      spreadsheetId: spreadsheet,
      range: `${sheet}!${calculatedCellAddress}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[value]],
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
    updatedCells: 1,
    updatedColumns: 1,
    updatedRange: 'Sheet1!A1',
    updatedRows: 1,
  }),
});

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { GoogleSheets } from '../google-sheets.app';
import { z } from 'zod';

export class UpdateCell extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleSheets;

  id() {
    return 'google-sheets_action_update-cell';
  }

  name() {
    return 'Update Cell';
  }

  description() {
    return 'Updates a specific cell in the specified sheet.';
  }

  aiSchema() {
    return z.object({
      spreadsheet: z.string().min(1).describe('The ID of the spreadsheet'),
      sheet: z.string().min(1).describe('The name of the sheet'),
      cellAddress: z.string().min(1).describe('The cell address, e.g., A1'),
      value: z.string().min(1).describe('The value to set in the cell'),
    });
  }

  inputConfig(): InputConfig[] {
    return [
      this.app.dynamicSelectSpreadSheets(),
      this.app.dynamicSelectSheetNames(),
      {
        id: 'useCellAddress',
        label: 'Use Cell Address',
        description: 'Use cell address or enter row index and column',
        inputType: 'switch',
        switchOptions: {
          checked: 'true',
          unchecked: 'false',
          defaultChecked: true,
        },
      },
      {
        id: 'cellAddress',
        label: 'Cell',
        description: 'The cell address to update, e.g., A1',
        inputType: 'text',
        placeholder: 'Enter cell address, e.g., A1',
        loadOptions: {
          dependsOn: [
            {
              id: 'useCellAddress',
              value: 'true',
            },
          ],
        },
      },
      {
        ...this.app.dynamicSelectColumnsDropdown(),
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
      {
        id: 'rowIndex',
        label: 'Row Index',
        description: 'The row index to update',
        inputType: 'number',
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
      },
      {
        id: 'value',
        label: 'Value',
        description: 'The value to set in the cell',
        inputType: 'text',
        placeholder: 'Enter the value to set',
        required: {
          missingMessage: 'Value is required',
          missingStatus: 'warning',
        },
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

    const {
      spreadsheet,
      sheet,
      cellAddress,
      value,
      rowIndex,
      column,
      useCellAddress,
    } = configValue;

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
        : `${this.app.getColumnLetter(column)}${rowIndex}`;

    // Update the specific cell in the specified sheet
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
  }

  async mockRun(): Promise<Response> {
    return mockResponse;
  }
}

const mockResponse = {
  spreadsheetId: 'some-spreadsheet-id',
  updatedCells: 1,
  updatedColumns: 1,
  updatedRange: 'Sheet1!A1',
  updatedRows: 1,
};

type Response = typeof mockResponse;

type ConfigValue = z.infer<ReturnType<UpdateCell['aiSchema']>> & {
  rowIndex: number;
  column: number;
  useCellAddress: 'true' | 'false';
};

import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { GoogleSheets } from '../google-sheets.app';

export class GetSheetData extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleSheets;
  id() {
    return 'google-sheets_action_get-sheet-data';
  }
  name() {
    return 'Get Sheet Data';
  }
  description() {
    return 'Reads data from a specified Google Sheets document and sheet.';
  }
  aiSchema() {
    return z.object({
      spreadsheet: z
        .string()
        .min(1)
        .describe('The ID of the Google Sheets document.'),
      sheet: z.string().min(1).describe('The sheet name.'),
      range: z
        .string()
        .min(1)
        .describe(
          'The range of cells to read (e.g., "Sheet1!A1:D10"). Leave empty to read the entire sheet.',
        )
        .nullable()
        .optional(),
      loadAllData: z
        .enum(['true', 'false'])
        .default('true')
        .describe('If true, all sheet data will be returned')
        .nullable()
        .optional(),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      this.app.dynamicSelectSpreadSheets(),
      this.app.dynamicSelectSheetNames(),
      {
        id: 'loadAllData',
        label: 'Load All Data',
        inputType: 'switch',
        description: '',
        switchOptions: {
          checked: 'true',
          unchecked: 'false',
          defaultChecked: true,
        },
      },
      {
        id: 'range',
        label: 'Custom Range',
        description: 'The range of cells to read (e.g., "Sheet1!A1:D10").',
        inputType: 'text',
        placeholder: 'Enter range',
        loadOptions: {
          dependsOn: [
            {
              id: 'loadAllData',
              value: 'false',
            },
          ],
        },
      },
    ];
  }

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<any> {
    const sheets = await this.app.googleSheets({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { spreadsheet, sheet, range, loadAllData } = configValue;

    let appliedRange = sheet;

    if (loadAllData === 'false') {
      if (!range) {
        throw new Error('Range is required when "Load All Data" is disabled.');
      }

      appliedRange = range;
    }

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId: spreadsheet,
      range: appliedRange,
    });

    return response.data;
  }

  async mockRun(): Promise<any> {
    return {
      range: 'Sheet1!A1:D10',
      majorDimension: 'ROWS',
      values: [
        ['Name', 'Age', 'Email', 'Phone'],
        ['John Doe', '30', 'john.doe@example.com', '+1234567890'],
        ['Jane Smith', '25', 'jane.smith@example.com', '+0987654321'],
      ],
    };
  }
}

type ConfigValue = z.infer<ReturnType<GetSheetData['aiSchema']>>;

import { createAction } from '@lecca-io/toolkit';
import {
  createSwitchInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-sheets.shared';

export const getSheetData = createAction({
  id: 'google-sheets_action_get-sheet-data',
  name: 'Get Sheet Data',
  description: 'Reads data from a specified Google Sheets document and sheet.',
  aiSchema: z.object({
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
  }),
  inputConfig: [
    shared.fields.dynamicSelectSpreadSheets,
    shared.fields.dynamicSelectSheetNames,
    createSwitchInputField({
      id: 'loadAllData',
      label: 'Load All Data',
      description: '',
      switchOptions: {
        checked: 'true',
        unchecked: 'false',
        defaultChecked: true,
      },
    }),
    createTextInputField({
      id: 'range',
      label: 'Custom Range',
      description: 'The range of cells to read (e.g., "Sheet1!A1:D10").',
      placeholder: 'Enter range',
      loadOptions: {
        dependsOn: [
          {
            id: 'loadAllData',
            value: 'false',
          },
        ],
      },
    }),
  ],
  run: async ({ configValue, connection }) => {
    const sheets = shared.googleSheets({
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
  },
  mockRun: async () => {
    return {
      range: 'Sheet1!A1:D10',
      majorDimension: 'ROWS',
      values: [
        ['Name', 'Age', 'Email', 'Phone'],
        ['John Doe', '30', 'john.doe@example.com', '+1234567890'],
        ['Jane Smith', '25', 'jane.smith@example.com', '+0987654321'],
      ],
    };
  },
});

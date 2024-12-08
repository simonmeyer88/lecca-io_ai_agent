import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { GoogleSheets } from '../google-sheets.app';

export class RenameSheet extends Action {
  app: GoogleSheets;
  id = 'google-sheets_action_rename-sheet';
  name = 'Rename Sheet';
  description =
    'Renames the title of an existing sheet in a Google Sheets document.';
  aiSchema = z.object({
    spreadsheet: z
      .string()
      .min(1)
      .describe('The ID of the Google Sheets document.'),
    sheet: z.string().min(1).describe('The ID of the sheet to be updated.'),
    newTitle: z.string().min(1).describe('The new title for the sheet.'),
  });
  inputConfig: InputConfig[] = [
    this.app.dynamicSelectSpreadSheets(),
    this.app.dynamicSelectSheetIds(),
    {
      id: 'newTitle',
      label: 'New Sheet Title',
      description: 'The new title for the sheet.',
      inputType: 'text',
      placeholder: 'Enter new sheet title',
      required: {
        missingMessage: 'New sheet title is required',
        missingStatus: 'warning',
      },
    },
  ];

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<any> {
    const sheets = await this.app.googleSheets({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { spreadsheet, sheet, newTitle } = configValue;

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheet,
      requestBody: {
        requests: [
          {
            updateSheetProperties: {
              properties: {
                sheetId: parseInt(sheet, 10),
                title: newTitle,
              },
              fields: 'title',
            },
          },
        ],
      },
    });

    return response.data;
  }

  async mockRun(): Promise<any> {
    return {
      spreadsheetId: 'mock-spreadsheet-id',
    };
  }
}

type ConfigValue = z.infer<RenameSheet['aiSchema']>;

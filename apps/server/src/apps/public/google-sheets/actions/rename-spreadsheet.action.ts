import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { GoogleSheets } from '../google-sheets.app';

export class RenameSpreadsheet extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleSheets;
  id = 'google-sheets_action_rename-spreadsheet';
  name = 'Rename Spreadsheet';
  description = 'Renames the title of an existing Google Sheets document.';
  aiSchema = z.object({
    spreadsheet: z
      .string()
      .min(1)
      .describe('The ID of the Google Sheets document.'),
    newTitle: z.string().min(1).describe('The new title for the spreadsheet.'),
  });
  inputConfig: InputConfig[] = [
    this.app.dynamicSelectSpreadSheets(),
    {
      id: 'newTitle',
      label: 'New Spreadsheet Title',
      description: 'The new title for the spreadsheet.',
      inputType: 'text',
      placeholder: 'Enter new spreadsheet title',
      required: {
        missingMessage: 'New spreadsheet title is required',
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

    const { spreadsheet, newTitle } = configValue;

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheet,
      requestBody: {
        requests: [
          {
            updateSpreadsheetProperties: {
              properties: {
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

type ConfigValue = z.infer<RenameSpreadsheet['aiSchema']>;

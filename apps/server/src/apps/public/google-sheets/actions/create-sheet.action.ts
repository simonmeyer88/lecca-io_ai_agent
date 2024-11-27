import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { GoogleSheets } from '../google-sheets.app';

export class CreateSheet extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleSheets;
  id = 'google-sheets_action_create-sheet';
  name = 'Create Sheet';
  description = 'Creates a new sheet in an existing Google Sheets document.';
  aiSchema = z.object({
    spreadsheet: z
      .string()
      .min(1)
      .describe('The ID of the Google Sheets document.'),
    sheetTitle: z.string().min(1).describe('The title of the new sheet.'),
  });
  inputConfig: InputConfig[] = [
    this.app.dynamicSelectSpreadSheets(),
    {
      id: 'sheetTitle',
      label: 'Sheet Title',
      description: 'The title of the new sheet.',
      inputType: 'text',
      placeholder: 'Enter sheet title',
      required: {
        missingMessage: 'Sheet title is required',
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

    const { spreadsheet, sheetTitle } = configValue;

    const response = await sheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheet,
      requestBody: {
        requests: [
          {
            addSheet: {
              properties: {
                title: sheetTitle,
              },
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
      replies: [
        {
          addSheet: {
            properties: {
              gridProperties: {
                rowCount: 1000,
                columnCount: 26,
              },
            },
            index: 1,
            sheetId: 123456789,
            sheetType: 'GRID',
            title: 'New Sheet',
          },
        },
      ],
    };
  }
}

type ConfigValue = z.infer<CreateSheet['aiSchema']>;

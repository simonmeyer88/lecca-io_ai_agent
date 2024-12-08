import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { GoogleSheets } from '../google-sheets.app';

export class CreateSpreadsheet extends Action {
  app: GoogleSheets;
  id = 'google-sheets_action_create-spreadsheet';
  name = 'Create Spreadsheet';
  description = 'Creates a new Google Sheets document.';
  aiSchema = z.object({
    title: z
      .string()
      .min(1)
      .describe('The title of the new Google Sheets document.'),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'title',
      label: 'Title',
      description: 'The title of the new Google Sheets document.',
      inputType: 'text',
      placeholder: 'Enter title',
      required: {
        missingMessage: 'Title is required',
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

    const { title } = configValue;

    const response = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title,
        },
      },
    });

    return response.data;
  }

  async mockRun(): Promise<any> {
    return {
      properties: {
        title: 'Mock Spreadsheet',
      },
      sheets: [
        {
          properties: {
            title: 'Sheet1',
            gridProperties: {
              rowCount: 1000,
              columnCount: 26,
            },
          },
        },
      ],
      spreadsheetId: 'mock-spreadsheet-id',
      spreadsheetUrl:
        'https://docs.google.com/spreadsheets/d/some-id/edit?ouid=some-id',
    };
  }
}

type ConfigValue = z.infer<CreateSpreadsheet['aiSchema']>;

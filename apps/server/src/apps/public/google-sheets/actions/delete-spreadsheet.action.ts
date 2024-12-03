import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { GoogleSheets } from '../google-sheets.app';
import { GoogleSheetsSpreadsheetDeleteResponseType } from '../types/google-sheets.type';

export class DeleteSpreadsheet extends Action {
  app: GoogleSheets;
  id = 'google-sheets_action_delete-spreadsheet';
  name = 'Delete Spreadsheet';
  description = 'Delete a spreadsheet.';
  aiSchema = z.object({
    spreadsheet: z
      .string()
      .min(1)
      .describe('The ID of the spreadsheet to delete'),
  });
  inputConfig: InputConfig[] = [
    {
      ...this.app.dynamicSelectSpreadSheets(),
      description: 'Select the spreadsheet to delete.',
    },
  ];

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<GoogleSheetsSpreadsheetDeleteResponseType> {
    const googleDrive = await this.app.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { spreadsheet } = configValue;

    await googleDrive.files.delete({
      fileId: spreadsheet,
    });

    return {
      spreadsheetId: spreadsheet,
    };
  }

  async mockRun(): Promise<GoogleSheetsSpreadsheetDeleteResponseType> {
    return {
      spreadsheetId: 'mock-spreadsheet-id',
    };
  }
}

type ConfigValue = z.infer<DeleteSpreadsheet['aiSchema']>;

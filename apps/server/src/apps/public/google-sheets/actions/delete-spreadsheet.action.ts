import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { GoogleSheets } from '../google-sheets.app';
import { GoogleSheetsSpreadsheetDeleteResponseType } from '../types/google-sheets.type';
import { z } from 'zod';

export class DeleteSpreadsheet extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleSheets;
  id() {
    return 'google-sheets_action_delete-spreadsheet';
  }
  name() {
    return 'Delete Spreadsheet';
  }
  description() {
    return 'Delete a spreadsheet.';
  }
  aiSchema() {
    return z.object({
      spreadsheet: z
        .string()
        .min(1)
        .describe('The ID of the spreadsheet to delete'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        ...this.app.dynamicSelectSpreadSheets(),
        description: 'Select the spreadsheet to delete.',
      },
    ];
  }

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

type ConfigValue = z.infer<ReturnType<DeleteSpreadsheet['aiSchema']>>;

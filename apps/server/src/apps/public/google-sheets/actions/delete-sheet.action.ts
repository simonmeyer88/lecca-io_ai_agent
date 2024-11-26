import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { GoogleSheets } from '../google-sheets.app';
import { GoogleSheetsSheetDeleteResponseType } from '../types/google-sheets.type';

export class DeleteSheet extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleSheets;
  id() {
    return 'google-sheets_action_delete-sheet';
  }
  name() {
    return 'Delete Sheet';
  }
  description() {
    return 'Delete a sheet.';
  }
  aiSchema() {
    return z.object({
      sheet: z.string().min(1).describe('The ID of the sheet to delete'),
      spreadsheet: z
        .string()
        .min(1)
        .describe('The ID of the spreadsheet that contains the sheet'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        ...this.app.dynamicSelectSpreadSheets(),
        description: 'Select the spreadsheet of the sheet you want to delete.',
      },
      {
        ...this.app.dynamicSelectSheetIds(),
        description: 'Select the sheet you want to delete.',
      },
    ];
  }

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<GoogleSheetsSheetDeleteResponseType> {
    const googleSheets = await this.app.googleSheets({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { sheet, spreadsheet } = configValue;

    await googleSheets.spreadsheets.batchUpdate({
      spreadsheetId: spreadsheet,
      requestBody: {
        requests: [
          {
            deleteSheet: {
              sheetId: Number(sheet),
            },
          },
        ],
      },
    });

    return {
      sheetId: sheet,
      deleted: true,
    };
  }

  async mockRun(): Promise<GoogleSheetsSheetDeleteResponseType> {
    return {
      sheetId: 'mock-sheet-id',
      deleted: true,
    };
  }
}

type ConfigValue = z.infer<ReturnType<DeleteSheet['aiSchema']>>;

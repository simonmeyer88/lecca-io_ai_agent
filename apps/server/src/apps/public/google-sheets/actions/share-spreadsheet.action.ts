import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { GoogleSheets } from '../google-sheets.app';
import { GoogleSheetsSpreadsheetShareType } from '../types/google-sheets.type';

export class ShareSpreadsheet extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleSheets;
  id() {
    return 'google-sheets_action_share-spreadsheet';
  }
  name() {
    return 'Share Spreadsheet';
  }
  description() {
    return `Share a spreadsheet that ${ServerConfig.PLATFORM_NAME} has created.`;
  }
  aiSchema() {
    return z.object({
      spreadsheet: z
        .string()
        .min(1)
        .describe('The ID of the spreadsheet to share'),
      role: z
        .enum(['writer', 'commenter', 'reader'])
        .describe('The role of the user'),
      email: z.string().email().min(1).describe('The email of the user'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        ...this.app.dynamicSelectSpreadSheets(),
        description: 'Select a spreadsheet to share',
      },
      {
        id: 'role',
        label: 'Role',
        description: 'The role of the user',
        inputType: 'select',
        placeholder: 'Select a role',
        selectOptions: [
          {
            label: 'Writer',
            value: 'writer',
          },
          {
            label: 'Commenter',
            value: 'commenter',
          },
          {
            label: 'Reader',
            value: 'reader',
          },
        ],
        required: {
          missingMessage: 'Content is required',
          missingStatus: 'warning',
        },
      },
      {
        id: 'email',
        label: 'Email',
        description: 'The email address of the user',
        inputType: 'text',
        placeholder: 'Enter email',
        required: {
          missingMessage: 'Email is required',
          missingStatus: 'warning',
        },
      },
    ];
  }

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<GoogleSheetsSpreadsheetShareType> {
    const googleDrive = await this.app.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { spreadsheet, role, email } = configValue;

    // Create new spreadsheet with initial content.
    // Share the spreadsheet with specified email or group.
    await googleDrive.permissions.create({
      fileId: spreadsheet,
      requestBody: {
        role: role,
        type: 'user',
        emailAddress: email,
      },
    });

    return {
      spreadsheetId: spreadsheet,
      role: role,
      emailAddress: email,
    };
  }

  async mockRun(): Promise<GoogleSheetsSpreadsheetShareType> {
    return {
      spreadsheetId: 'mock-spreadsheet-id',
      role: 'commenter',
      emailAddress: 'example@test.com',
    };
  }
}

type ConfigValue = z.infer<ReturnType<ShareSpreadsheet['aiSchema']>>;

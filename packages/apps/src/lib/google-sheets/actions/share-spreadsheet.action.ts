import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-sheets.shared';

export const shareSpreadsheet = createAction({
  id: 'google-sheets_action_share-spreadsheet',
  name: 'Share Spreadsheet',
  description: `Share a spreadsheet that this platform has created.`,
  aiSchema: z.object({
    spreadsheet: z
      .string()
      .min(1)
      .describe('The ID of the spreadsheet to share'),
    role: z
      .enum(['writer', 'commenter', 'reader'])
      .describe('The role of the user'),
    email: z.string().email().min(1).describe('The email of the user'),
  }),
  inputConfig: [
    {
      ...shared.fields.dynamicSelectSpreadSheets,
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
  ],
  run: async ({ configValue, connection }) => {
    const googleDrive = shared.googleDrive({
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
  },
  mockRun: async () => {
    return {
      spreadsheetId: 'mock-spreadsheet-id',
      role: 'commenter',
      emailAddress: 'example@test.com',
    };
  },
});

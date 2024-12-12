import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/gmail.shared';

export const archiveEmail = createAction({
  id: 'gmail_action_archive-email',
  name: 'Archive Email',
  description: 'Archive an email in Gmail',
  inputConfig: [
    createTextInputField({
      label: 'Message ID',
      id: 'messageId',
      placeholder: 'Add message ID',
      description: 'The ID of the email to archive',
      required: {
        missingMessage: 'Message ID is required',
        missingStatus: 'warning',
      },
    }),
  ],
  aiSchema: z.object({
    messageId: z.string().min(1).describe('The ID of the email to archive'),
  }),
  run: async ({ configValue, connection }): Promise<boolean> => {
    const gmail = shared.gmail({
      accessToken: connection?.accessToken,
      refreshToken: connection?.refreshToken,
    });

    await gmail.users.messages.modify({
      userId: 'me',
      id: configValue.messageId,
      requestBody: {
        removeLabelIds: ['INBOX'],
      },
    });

    return true;
  },
  mockRun: async (): Promise<boolean> => {
    return true;
  },
});

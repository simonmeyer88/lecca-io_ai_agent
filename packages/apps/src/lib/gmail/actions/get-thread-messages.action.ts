import { createAction } from '@lecca-io/toolkit';
import { createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { GmailParsedEmail, shared } from '../shared/gmail.shared';

export const getThreadMessages = createAction({
  id: 'gmail_action_get-thread-messages',
  name: 'Get Thread Messages',
  description: 'Retrieve messages from a Gmail thread',
  inputConfig: [
    createTextInputField({
      id: 'threadId',
      label: 'Thread ID',
      placeholder: 'Add the thread ID',
      description: 'The thread ID of the email to retrieve messages from',
      required: {
        missingMessage: 'Thread ID is required',
        missingStatus: 'warning',
      },
    }),
  ],
  aiSchema: z.object({
    threadId: z
      .string()
      .min(1)
      .describe('The thread ID of the email to retrieve messages from'),
  }),
  run: async ({ configValue, connection }) => {
    const gmail = shared.gmail({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const messagesResponse = await gmail.users.threads.get({
      userId: 'me',
      id: configValue.threadId,
    });

    const messages = messagesResponse.data.messages || [];

    const parsedMessages: GmailParsedEmail[] = [];
    for (const message of messages) {
      if (message.id) {
        const messageResponse = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
        });
        parsedMessages.push(
          shared.parseEmail(messageResponse, { htmlOrText: 'both' }),
        );
      }
    }

    return parsedMessages;
  },
  mockRun: async () => {
    return [shared.mockEmail];
  },
});

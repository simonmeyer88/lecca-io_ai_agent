import {
  createTimeBasedPollTrigger,
  isValidMilliOrNull,
} from '@lecca-io/toolkit';

import { GmailParsedEmail, shared } from '../shared/gmail.shared';

export const emailReceived = createTimeBasedPollTrigger({
  id: 'gmail_trigger_email-received',
  name: 'Email Received',
  description: 'Triggers when a new email is received',
  inputConfig: [
    {
      label: 'Labels',
      id: 'labelIds',
      inputType: 'dynamic-multi-select',
      placeholder: 'Add labels',
      description: 'The IDs of the labels to filter emails',
      defaultValue: ['UNREAD', 'INBOX'],
      _getDynamicValues: async ({ connection }) => {
        const gmail = shared.gmail({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        const labels = await gmail.users.labels.list({
          userId: 'me',
        });

        return (
          labels?.data?.labels?.map((label) => ({
            label: label.name,
            value: label.id,
          })) ?? []
        );
      },
    },
    {
      label: 'HTML or Text',
      id: 'htmlOrText',
      inputType: 'select',
      defaultValue: 'text',
      selectOptions: [
        { value: 'html', label: 'HTML' },
        { value: 'text', label: 'Text' },
        { value: 'both', label: 'Both' },
      ],
      description:
        'Choose whether to return the email as HTML, text, or both. Not every email will have both HTML and text versions.',
    },
  ],
  run: async ({ configValue, connection }) => {
    const gmail = shared.gmail({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const response = await gmail.users.messages.list({
      userId: 'me',
      labelIds: configValue.labelIds ?? [],
      maxResults: 5,
    });

    const messages = await Promise.all(
      response.data.messages.map(async (message) => {
        const messageResponse = await gmail.users.messages.get({
          userId: 'me',
          id: message.id,
        });

        return shared.parseEmail(messageResponse, {
          htmlOrText: configValue.htmlOrText,
        });
      }),
    );

    return messages;
  },
  mockRun: async () => {
    return [shared.mockEmail];
  },
  extractTimestampFromResponse({ response }: { response: GmailParsedEmail }) {
    return isValidMilliOrNull(response?.internalDate);
  },
});

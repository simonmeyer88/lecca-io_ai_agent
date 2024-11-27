import { InputConfig } from '@/apps/lib/input-config';
import {
  RunTriggerArgs,
  TimeBasedPollTrigger,
  TriggerConstructorArgs,
} from '@/apps/lib/trigger';
import { isValidMilli } from '@/apps/utils/is-valid-milli';

import { Gmail } from '../gmail.app';
import { GmailParsedEmail } from '../types/gmail.types';

export class EmailReceived extends TimeBasedPollTrigger {
  constructor(args: TriggerConstructorArgs) {
    super(args);
  }

  app: Gmail;
  id = 'gmail_trigger_email-received';
  name = 'Email Received';
  description = 'Triggers when a new email is received';
  inputConfig: InputConfig[] = [
    {
      label: 'Labels',
      id: 'labelIds',
      inputType: 'dynamic-multi-select',
      placeholder: 'Add labels',
      description: 'The IDs of the labels to filter emails',
      defaultValue: ['UNREAD', 'INBOX'],
      _getDynamicValues: async ({ connection }) => {
        const gmail = await this.app.gmail({
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
  ];

  async run({
    configValue,
    connection,
  }: RunTriggerArgs<EmailReceivedConfigValue>): Promise<GmailParsedEmail[]> {
    const gmail = await this.app.gmail({
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

        return this.app.parseEmail(messageResponse, {
          htmlOrText: configValue.htmlOrText,
        });
      }),
    );

    return messages;
  }

  async mockRun(): Promise<GmailParsedEmail[]> {
    return [this.app.mockEmail];
  }

  extractTimestampFromResponse({ response }: { response: GmailParsedEmail }) {
    return isValidMilli(response?.internalDate);
  }
}

type EmailReceivedConfigValue = {
  labelIds: string[];
  htmlOrText: 'html' | 'text' | 'both';
};

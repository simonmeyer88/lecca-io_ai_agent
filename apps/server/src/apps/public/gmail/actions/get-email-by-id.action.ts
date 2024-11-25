import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { Gmail } from '../gmail.app';
import { GmailParsedEmail } from '../types/gmail.types';
import { z } from 'zod';

export class GetEmailById extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Gmail;

  id() {
    return 'gmail_action_get-email-by-id';
  }

  name() {
    return 'Get Email by ID';
  }

  description() {
    return 'Retrieve a single email from Gmail using its message ID';
  }

  aiSchema() {
    return z.object({
      messageId: z
        .string()
        .nonempty()
        .describe('The ID of the Gmail message to retrieve.'),
      htmlOrText: z
        .enum(['html', 'text', 'both'])
        .nullable()
        .optional()
        .describe('Choose whether to return the email as HTML, text, or both'),
    });
  }

  inputConfig(): InputConfig[] {
    return [
      {
        label: 'Message ID',
        id: 'messageId',
        inputType: 'text',
        placeholder: 'Enter message ID',
        description: 'The unique ID of the Gmail message you want to retrieve',
        required: {
          missingMessage: 'Message ID is required',
          missingStatus: 'warning',
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
        loadOptions: {
          dependsOn: [
            {
              id: 'includeBody',
              value: 'true',
            },
          ],
        },
        description:
          'Choose whether to return the email as HTML, text, or both. Not every email will have both HTML and text versions.',
      },
    ];
  }

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<GmailParsedEmail> {
    const gmail = await (this.app as Gmail).gmail({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const messageResponse = await gmail.users.messages.get({
      userId: 'me',
      id: configValue.messageId,
    });

    return this.app.parseEmail(messageResponse, {
      htmlOrText: configValue.htmlOrText,
    });
  }

  async mockRun(): Promise<GmailParsedEmail> {
    return this.app.mockEmail;
  }
}

type ConfigValue = z.infer<ReturnType<GetEmailById['aiSchema']>>;

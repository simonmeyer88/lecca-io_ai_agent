import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Gmail } from '../gmail.app';

import MailComposer = require('nodemailer/lib/mail-composer');

export class CreateDraftReply extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Gmail;
  id = 'gmail_action_create-draft-reply';
  name = 'Create Draft Reply';
  description = 'Create a draft reply email in Gmail';
  aiSchema = z.object({
    threadId: z
      .string()
      .min(1)
      .describe('The thread ID of the email being replied to'),
    to: z.string().email().describe('The email address of the recipient'),
    cc: z.string().email().optional().describe('CC recipient email address'),
    bcc: z.string().email().optional().describe('BCC recipient email address'),
    body: z.string().min(1).describe('The body of the reply'),
    bodyType: z
      .enum(['text', 'html'])
      .describe('The format of the body: text or HTML'),
  });
  inputConfig: InputConfig[] = [
    {
      label: 'Thread ID',
      id: 'threadId',
      inputType: 'text',
      placeholder: 'Enter thread ID',
      description: 'The ID of the email thread to reply to',
      required: {
        missingMessage: 'Thread ID is required',
        missingStatus: 'warning',
      },
    },
    {
      label: 'Recipient',
      id: 'to',
      inputType: 'text',
      placeholder: 'Add recipient',
      description: 'The email address of the recipient',
      required: {
        missingMessage: 'Recipient is required',
        missingStatus: 'warning',
      },
    },
    {
      label: 'CC',
      id: 'cc',
      inputType: 'text',
      placeholder: 'Add CC recipient (optional)',
      description: 'The CC recipient email address (optional)',
    },
    {
      label: 'BCC',
      id: 'bcc',
      inputType: 'text',
      placeholder: 'Add BCC recipient (optional)',
      description: 'The BCC recipient email address (optional)',
    },
    {
      label: 'Body',
      id: 'body',
      inputType: 'text',
      placeholder: 'Add reply body',
      description: 'The body of the reply',
      required: {
        missingMessage: 'Message body is required',
        missingStatus: 'warning',
      },
    },
    {
      label: 'Body Type',
      id: 'bodyType',
      inputType: 'select',
      selectOptions: [
        { value: 'text', label: 'Text' },
        { value: 'html', label: 'HTML' },
      ],
      description: 'Select the format of the email body (text or HTML)',
      required: {
        missingMessage: 'Body type is required',
        missingStatus: 'warning',
      },
    },
  ];

  async run({ configValue, connection }: RunActionArgs<ConfigValue>) {
    const buildMessage = () =>
      new Promise<string>((resolve, reject) => {
        const message = new MailComposer({
          to: configValue.to,
          cc: configValue.cc || undefined,
          bcc: configValue.bcc || undefined,
          [configValue.bodyType]: configValue.body, // Choose between text or html based on bodyType
          inReplyTo: configValue.threadId,
          references: [configValue.threadId],
          attachments: [],
        });

        message.compile().build((err, msg) => {
          if (err) {
            reject(err);
          }

          const encodedMessage = Buffer.from(msg)
            .toString('base64')
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');

          resolve(encodedMessage);
        });
      });

    const encodedMessage = await buildMessage();

    const gmail = await this.app.gmail({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const createDraftResponse = await gmail.users.drafts.create({
      userId: 'me',
      requestBody: {
        message: {
          raw: encodedMessage,
          threadId: configValue.threadId, // Include the threadId for reply
        },
      },
    });

    const draftResponse = await gmail.users.drafts.get({
      userId: 'me',
      id: createDraftResponse.data.id,
    });

    return this.app.parseDraft(draftResponse);
  }

  async mockRun() {
    return this.app.mockDraft;
  }
}

type ConfigValue = z.infer<CreateDraftReply['aiSchema']>;

import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Gmail } from '../gmail.app';
import { GmailParsedEmail } from '../types/gmail.types';

import MailComposer = require('nodemailer/lib/mail-composer');
import Mail = require('nodemailer/lib/mailer');

export class ReplyToThread extends Action {
  app: Gmail;
  id = 'gmail_action_reply-to-thread';
  name = 'Reply to Email Thread';
  description = 'Reply to an existing email thread using Gmail';
  aiSchema = z.object({
    threadId: z
      .string()
      .min(1)
      .describe('The thread ID of the email to reply to'),
    to: z.string().email().describe('The email address of the recipient'),
    cc: z.string().email().optional().describe('CC recipient email address'),
    bcc: z.string().email().optional().describe('BCC recipient email address'),
    body: z.string().min(1).describe('The body of the reply'),
    bodyType: z
      .enum(['text', 'html'])
      .describe('The format of the body: text or HTML'),
    attachments: z
      .array(z.string())
      .nullable()
      .optional()
      .describe('Attachment URLs'),
  });
  inputConfig: InputConfig[] = [
    {
      label: 'Thread ID',
      id: 'threadId',
      inputType: 'text',
      placeholder: 'Add the thread ID',
      description: 'The thread ID of the email to reply to',
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
      placeholder: 'Add body',
      description: 'The body of the email',
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
    {
      label: 'Attachments',
      id: 'attachments',
      inputType: 'file',
      occurenceType: 'multiple',
      description: 'Add attachment url',
    },
  ];

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<GmailParsedEmail> {
    const attachments: Mail.Attachment[] = [];
    if (configValue.attachments?.length) {
      await Promise.all(
        configValue.attachments.map(async (attachmentUrl) => {
          const attachmentResponse =
            await this.app.fetchAttachment(attachmentUrl);

          if (attachmentResponse) {
            attachments.push(attachmentResponse);
          }
        }),
      );
    }

    const buildMessage = () =>
      new Promise<string>((resolve, reject) => {
        const message = new MailComposer({
          to: configValue.to,
          cc: configValue.cc || undefined,
          bcc: configValue.bcc || undefined,
          [configValue.bodyType]: configValue.body, // Choose between text or html based on bodyType
          inReplyTo: configValue.threadId,
          references: [configValue.threadId],
          attachments,
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

    const sendResponse = await gmail.users.messages.send({
      userId: 'me',
      requestBody: {
        raw: encodedMessage,
        threadId: configValue.threadId,
      },
    });

    if (sendResponse.data) {
      const messageResponse = await gmail.users.messages.get({
        userId: 'me',
        id: sendResponse.data.id,
      });

      return this.app.parseEmail(messageResponse, {
        htmlOrText: 'both',
      });
    }
  }

  async mockRun(): Promise<GmailParsedEmail> {
    return this.app.mockEmail;
  }
}

type ConfigValue = z.infer<ReplyToThread['aiSchema']>;

import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/gmail.shared';

import MailComposer = require('nodemailer/lib/mail-composer');
import Mail = require('nodemailer/lib/mailer');

export const replyToThread = createAction({
  id: 'gmail_action_reply-to-thread',
  name: 'Reply to Email Thread',
  description: 'Reply to an existing email thread using Gmail',
  inputConfig: [
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
  ],
  aiSchema: z.object({
    threadId: z.string().describe('The thread ID of the email to reply to'),
    to: z.string().email().describe('The email address of the recipient'),
    cc: z.string().email().optional().describe('CC recipient email address'),
    bcc: z.string().email().optional().describe('BCC recipient email address'),
    body: z.string().describe('The body of the reply'),
    bodyType: z
      .enum(['text', 'html'])
      .describe('The format of the body: text or HTML'),
    attachments: z
      .array(z.string())
      .nullable()
      .optional()
      .describe('Attachment URLs'),
  }),
  run: async ({ configValue, connection, fileHandler }) => {
    const attachments: Mail.Attachment[] = [];
    if (configValue.attachments?.length) {
      await Promise.all(
        configValue.attachments.map(async (attachmentUrl) => {
          const attachmentResponse = await shared.fetchAttachment({
            url: attachmentUrl,
            fileHandler,
          });

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
          [configValue.bodyType]: configValue.body,
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

    const gmail = shared.gmail({
      accessToken: connection?.accessToken || '',
      refreshToken: connection?.refreshToken || '',
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

      return shared.parseEmail(messageResponse, {
        htmlOrText: 'both',
      });
    }
  },
  mockRun: async () => {
    return shared.mockEmail;
  },
});

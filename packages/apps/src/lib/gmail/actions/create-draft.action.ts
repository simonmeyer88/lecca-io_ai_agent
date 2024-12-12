import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/gmail.shared';

import MailComposer = require('nodemailer/lib/mail-composer');
import Mail = require('nodemailer/lib/mailer');

export const createDraft = createAction({
  id: 'gmail_action_create-draft',
  name: 'Create Draft',
  description: 'Create a draft email in Gmail',
  inputConfig: [
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
      label: 'Subject',
      id: 'subject',
      inputType: 'text',
      placeholder: 'Add subject',
      description: 'The subject of the email',
      required: {
        missingMessage: 'Subject is required',
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
      defaultValue: 'text',
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
    to: z.string().email().describe('The email address of the recipient'),
    subject: z.string().min(1).describe('The subject of the email'),
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
          subject: configValue.subject,
          cc: configValue.cc || undefined,
          bcc: configValue.bcc || undefined,
          [configValue.bodyType]: configValue.body,
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
      accessToken: connection?.accessToken,
      refreshToken: connection?.refreshToken,
    });

    const createDraftResponse = await gmail.users.drafts.create({
      userId: 'me',
      requestBody: {
        message: {
          raw: encodedMessage,
        },
      },
    });

    const draftResponse = await gmail.users.drafts.get({
      userId: 'me',
      id: createDraftResponse.data.id,
    });

    return shared.parseDraft(draftResponse);
  },
  mockRun: async () => {
    return shared.mockDraft;
  },
});

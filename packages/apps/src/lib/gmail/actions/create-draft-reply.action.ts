import { createAction } from '@lecca-io/toolkit';
import MailComposer from 'nodemailer/lib/mail-composer';
import { z } from 'zod';

import { shared } from '../shared/gmail.shared';

export const createDraftReply = createAction({
  id: 'gmail_action_create-draft-reply',
  name: 'Create Draft Reply',
  description: 'Create a draft reply email in Gmail',
  inputConfig: [
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
  ],
  aiSchema: z.object({
    threadId: z
      .string()
      .describe('The thread ID of the email being replied to'),
    to: z.string().email().describe('The email address of the recipient'),
    cc: z.string().email().optional().describe('CC recipient email address'),
    bcc: z.string().email().optional().describe('BCC recipient email address'),
    body: z.string().describe('The body of the reply'),
    bodyType: z
      .enum(['text', 'html'])
      .describe('The format of the body: text or HTML'),
  }),
  run: async ({ configValue, connection }) => {
    const buildMessage = () =>
      new Promise<string>((resolve, reject) => {
        const message = new MailComposer({
          to: configValue.to,
          cc: configValue.cc || undefined,
          bcc: configValue.bcc || undefined,
          [configValue.bodyType]: configValue.body,
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

    const gmail = shared.gmail({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const createDraftResponse = await gmail.users.drafts.create({
      userId: 'me',
      requestBody: {
        message: {
          raw: encodedMessage,
          threadId: configValue.threadId,
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

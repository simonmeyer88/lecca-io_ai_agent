import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { MicrosoftOutlook } from '../microsoft-outlook.app';

export class CreateDraft extends Action {
  app: MicrosoftOutlook;
  id = 'microsoft-outlook_action_create-draft';
  name = 'Create Draft';
  description = 'Create a draft email using Outlook';
  aiSchema = z.object({
    recipientEmails: z
      .array(z.string())
      .min(1)
      .describe('The email address of the recipient(s)'),
    subject: z.string().min(1).describe('The subject of the email'),
    contentType: z
      .enum(['HTML', 'Text'])
      .describe('The content type of the email'),
    body: z.string().min(1).describe('The body of the email'),
    ccRecipientEmails: z
      .array(z.string())
      .nullable()
      .optional()
      .describe('The email address of the recipient(s)'),
  });
  inputConfig: InputConfig[] = [
    {
      label: 'Recipients',
      id: 'recipientEmails',
      inputType: 'text',
      placeholder: 'Add recipient',
      occurenceType: 'multiple',
      description: 'The email address of the recipient(s)',
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
      label: 'Content Type',
      id: 'contentType',
      inputType: 'select',
      selectOptions: [
        {
          label: 'HTML',
          value: 'HTML',
        },
        {
          label: 'Text',
          value: 'Text',
        },
      ],
      defaultValue: 'Text',
      required: {
        missingMessage: 'Content type is required',
        missingStatus: 'warning',
      },
      description: 'The content type of the email',
    },
    {
      label: 'Body',
      id: 'body',
      inputType: 'text',
      placeholder: 'Add body',
      description: 'The body of the email',
      required: {
        missingMessage: 'Message is required',
        missingStatus: 'warning',
      },
    },
    {
      label: 'CC Recipients',
      id: 'ccRecipientEmails',
      inputType: 'text',
      placeholder: 'Add CC recipient',
      occurenceType: 'multiple',
      description: 'The email address of the recipient(s)',
    },
  ];

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<unknown> {
    const url = 'https://graph.microsoft.com/v1.0/me/messages';
    const data = {
      subject: configValue.subject,
      body: {
        contentType: configValue.contentType,
        content: configValue.body,
      },
      toRecipients:
        configValue?.recipientEmails.map((email) => ({
          emailAddress: {
            address: email,
          },
        })) ?? [],
      ccRecipients:
        configValue?.ccRecipientEmails?.map((email) => ({
          emailAddress: {
            address: email,
          },
        })) ?? [],
    };

    const createDraftResult = await this.app.http.loggedRequest({
      method: 'POST',
      url,
      data,
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
      },
      workspaceId,
    });

    return createDraftResult.data;
  }

  async mockRun(): Promise<unknown> {
    return {};
  }
}

type ConfigValue = z.infer<CreateDraft['aiSchema']>;

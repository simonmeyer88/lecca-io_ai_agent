import {
  createAction,
  createFileInputField,
  createSwitchInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/surgemsg.shared';

export const sendMessage = createAction({
  id: 'surgemsg_action_send-message',
  name: 'Send Message',
  description: 'Send a message',
  inputConfig: [
    shared.fields.accountId,
    createTextInputField({
      id: 'body',
      label: 'Body',
      description: 'The body of the message.',
      placeholder: 'Enter the message body',
      required: {
        missingMessage: 'Message body is required',
        missingStatus: 'warning',
      },
    }),
    createFileInputField({
      id: 'attachmentUrl',
      label: 'Attachment URL',
      description: 'An optional URL of the attachment to send.',
      placeholder: 'Add attachment url (optional)',
    }),
    createSwitchInputField({
      id: 'useExistingConversation',
      label: 'Use Existing Conversation',
      description:
        'Whether to use an existing conversation or start a new one.',
      defaultValue: 'false',
      switchOptions: {
        checked: 'true',
        unchecked: 'false',
        defaultChecked: false,
      },
    }),
    createTextInputField({
      id: 'conversationId',
      label: 'Conversation ID',
      description:
        'The ID of the conversation. If not provided, a new conversation will be started, but the contact ID will be required.',
      placeholder: 'Add conversation ID (optional)',
      loadOptions: {
        dependsOn: [{ id: 'useExistingConversation', value: 'true' }],
      },
    }),
    createTextInputField({
      id: 'phoneNumber',
      label: 'Phone Number',
      description: 'The phone number of the contact in E.164 format.',
      placeholder: 'E.g. +18015551234',
      loadOptions: {
        dependsOn: [{ id: 'useExistingConversation', value: 'false' }],
      },
    }),
  ],
  aiSchema: z.object({
    accountId: z
      .string()
      .describe('The ID of the account to send the message from.'),
    body: z.string().describe('The body of the message.'),
    attachmentUrl: z
      .string()
      .optional()
      .nullable()
      .describe('An optional URL of the attachment to send.'),
    conversationId: z
      .string()
      .optional()
      .nullable()
      .describe(
        'The ID of the conversation. If not provided, a new conversation will be started, but the contact ID will be required.',
      ),
    phoneNumber: z
      .string()
      .optional()
      .nullable()
      .describe('The phone number of the contact in E.164 format.'),
  }),
  run: async ({ workspaceId, configValue, http, connection }) => {
    const { accountId, body, conversationId, phoneNumber } = configValue;
    const { apiKey } = connection;

    if (!accountId) {
      throw new Error('Account ID is required');
    }

    if (!conversationId && !phoneNumber) {
      throw new Error(
        'Either conversation ID or phone number is required. If you provide a conversation ID, the phone number is optional.',
      );
    }

    const data = {
      conversation: {
        id: conversationId?.trim() ? conversationId : undefined,
        contact: phoneNumber?.trim()
          ? { phone_number: phoneNumber }
          : undefined,
      },
      body,
    };

    const response = await http.request({
      method: 'POST',
      url: `https://api.surgemsg.com/messages`,
      workspaceId,
      data,
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Surge-Account': `${accountId}`,
      },
    });

    return response.data;
  },
  mockRun: async () => {
    return {
      attachments: [
        {
          id: 'att_01j9e0m1m6fc38gsv2vkfqgzz2',
          type: 'image',
          url: 'https://surgemsg.com/attachments/att_01jbwyqj7rejzat7pq03r7fgmf',
        },
      ],
      body: 'Thought you could leave without saying goodbye?',
      conversation: {
        contact: {
          first_name: 'Dominic',
          id: 'ctc_01j9dy8mdzfn3r0e8x1tbdrdrf',
          last_name: 'Toretto',
          phone_number: '+18015551234',
        },
        id: 'cnv_01j9e0dgmdfkj86c877ws0znae',
      },
      id: 'msg_01j9e0m1m6fc38gsv2vkfqgzz2',
    };
  },
});

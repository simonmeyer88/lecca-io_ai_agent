import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/surgemsg.shared';

export const createContact = createAction({
  id: 'surgemsg_action_create-contact',
  name: 'Create Contact',
  description: 'Creates a new contact.',
  inputConfig: [
    shared.fields.accountId,
    createTextInputField({
      id: 'phone_number',
      label: 'Phone Number',
      description: 'The phone number of the contact in E.164 format.',
      placeholder: 'Enter the phone number',
    }),
    createTextInputField({
      id: 'first_name',
      label: 'First Name',
      description: "The contact's first name.",
      placeholder: 'Enter the first name',
    }),
    createTextInputField({
      id: 'last_name',
      label: 'Last Name',
      description: "The contact's last name.",
      placeholder: 'Enter the last name',
    }),
  ],
  aiSchema: z.object({
    accountId: z
      .string()
      .describe('The ID of the account to send the message from.'),
    phone_number: z
      .string()
      .describe('The phone number of the contact in E.164 format.'),
    first_name: z
      .string()
      .describe("The contact's first name.")
      .optional()
      .nullable(),
    last_name: z
      .string()
      .describe("The contact's last name.")
      .optional()
      .nullable(),
  }),
  run: async ({ connection, http, workspaceId, configValue }) => {
    const { accountId, ...data } = configValue;
    const { apiKey } = connection;

    if (!accountId) {
      throw new Error('Account ID is required');
    }

    const response = await http.request({
      method: 'POST',
      url: `https://api.surgemsg.com/contacts`,
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
      first_name: 'Dominic',
      id: 'ctc_01j9dy8mdzfn3r0e8x1tbdrdrf',
      last_name: 'Toretto',
      phone_number: '+18015551234',
    };
  },
});

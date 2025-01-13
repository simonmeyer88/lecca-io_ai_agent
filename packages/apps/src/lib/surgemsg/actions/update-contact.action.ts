import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/surgemsg.shared';

export const updateContact = createAction({
  id: 'surgemsg_action_update-contact',
  name: 'Update Contact',
  description: 'Updates an existing contact.',
  inputConfig: [
    shared.fields.accountId,
    createTextInputField({
      id: 'contactId',
      label: 'Contact ID',
      description: 'The ID of the contact to retrieve.',
      placeholder: 'Enter the contact ID',
    }),
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
    contactId: z.string().describe('The ID of the contact to retrieve.'),
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
    const { accountId, contactId, first_name, last_name, phone_number } =
      configValue;
    const { apiKey } = connection;

    if (!accountId) {
      throw new Error('Account ID is required');
    }

    const response = await http.request({
      method: 'PUT',
      url: `https://api.surgemsg.com/contacts/${contactId}`,
      workspaceId,
      data: {
        phone_number: phone_number?.trim() ? phone_number : undefined,
        first_name: first_name?.trim() ? first_name : undefined,
        last_name: last_name?.trim() ? last_name : undefined,
      },
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

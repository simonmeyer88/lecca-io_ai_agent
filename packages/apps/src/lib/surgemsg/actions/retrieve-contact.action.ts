import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/surgemsg.shared';

export const retrieveContact = createAction({
  id: 'surgemsg_action_retrieve-contact',
  name: 'Retrieve Contact',
  description: 'Retrieve a contact by ID.',
  inputConfig: [
    shared.fields.accountId,
    createTextInputField({
      id: 'contactId',
      label: 'Contact ID',
      description: 'The ID of the contact to retrieve.',
      placeholder: 'Enter the contact ID',
    }),
  ],
  aiSchema: z.object({
    accountId: z
      .string()
      .describe('The ID of the account to send the message from.'),
    contactId: z.string().describe('The ID of the contact to retrieve.'),
  }),
  run: async ({ connection, http, workspaceId, configValue }) => {
    const { accountId, contactId } = configValue;
    const { apiKey } = connection;

    if (!accountId) {
      throw new Error('Account ID is required');
    }

    const response = await http.request({
      method: 'GET',
      url: `https://api.surgemsg.com/contacts/${contactId}`,
      workspaceId,
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

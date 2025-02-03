import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/hubspot.shared';

export const addContactToList = createAction({
  id: 'hubspot_action_add-contact-to-list',
  name: 'Add Contact to List',
  description: 'Adds a contact to a static list in Hubspot',
  inputConfig: [
    createTextInputField({
      id: 'email',
      label: 'Contact Email',
      description: '',
      placeholder: 'Add an email',
      required: {
        missingMessage: 'Email is required',
        missingStatus: 'warning',
      },
    }),
    shared.fields.dynamicGetStaticContactLists,
    {
      id: 'markdown1',
      inputType: 'markdown',
      label: '',
      description: '',
      markdown: 'Note that you cannot add a contact to a dynamic list',
    },
  ],
  aiSchema: z.object({
    email: z.string().email().describe('The email of the contact'),
    listId: z.string().describe('The ID of the list to add the contact to'),
  }),
  run: async ({ configValue, connection, workspaceId, http }) => {
    const { listId, email } = configValue;

    const url = `https://api.hubapi.com/contacts/v1/lists/${listId}/add`;

    const data = {
      emails: [email],
    };

    const result = await http.request({
      method: 'POST',
      url,
      data,
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
      },
      workspaceId,
    });

    if (result?.data) {
      return result.data;
    } else {
      throw new Error(`Failed to add contact to list: ${result?.data?.error}`);
    }
  },
  mockRun: async () => {
    return {
      updated: ['12999999999'],
      discarded: [],
      invalidVids: [],
      invalidEmails: [],
    };
  },
});

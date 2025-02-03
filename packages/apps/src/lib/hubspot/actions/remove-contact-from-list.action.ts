import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/hubspot.shared';

export const removeContactFromList = createAction({
  id: 'hubspot_action_remove-contact-from-list',
  name: 'Remove Contact from List',
  description: 'Removes a contact from a static list in Hubspot',
  aiSchema: z.object({
    email: z.string().email().describe('The email of the contact'),
    listId: z
      .string()
      .describe('The ID of the list to remove the contact from'),
  }),
  inputConfig: [
    createTextInputField({
      id: 'email',
      label: 'Contact Email',
      description: '',
      placeholder: 'Enter the contact email to remove',
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
      markdown: 'You cannot remove a contact from a dynamic list',
    },
  ],
  run: async ({ configValue, connection, workspaceId, http }) => {
    const { listId, email } = configValue;

    const url = `https://api.hubapi.com/contacts/v1/lists/${listId}/remove`;

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
      throw new Error(
        `Failed to remove contact from list: ${result?.data?.error}`,
      );
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

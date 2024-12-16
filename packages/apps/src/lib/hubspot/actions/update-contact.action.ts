import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/hubspot.shared';

export const updateContact = createAction({
  id: 'hubspot_action_update-contact',
  name: 'Update Contact',
  description: 'Updates an existing contact in Hubspot',
  inputConfig: [
    createTextInputField({
      id: 'identifier',
      label: 'Contact Email',
      description: 'The unique identifier of the contact (e.g., email or VID)',
      placeholder: 'Enter a contact email or VID',
      required: {
        missingMessage: 'Please provide an identifier',
        missingStatus: 'warning',
      },
    }),
    shared.fields.dynamicGetContactProperties,
  ],
  aiSchema: z.object({
    identifier: z
      .string()
      .min(1)
      .describe(
        'The unique identifier of the contact (e.g., email or contact ID)',
      ),
    properties: z
      .array(
        z.object({
          field: z.string().min(1).describe('The field to update'),
          value: z.string().min(1).describe('The value to update'),
        }),
      )
      .min(1)
      .describe('The field and value for the field to update'),
  }),
  run: async ({ configValue, connection, workspaceId, http }) => {
    const { identifier, properties } = configValue;

    let url = '';
    if (identifier.includes('@')) {
      url = `https://api.hubapi.com/contacts/v1/contact/email/${encodeURIComponent(identifier)}/profile`;
    } else {
      url = `https://api.hubapi.com/contacts/v1/contact/vid/${encodeURIComponent(identifier)}/profile`;
    }

    const data = {
      properties: properties.map(({ field, value }) => ({
        property: field,
        value,
      })),
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
      return {
        updated: true,
      };
    } else {
      throw new Error(`Something went wrong updating the contact`);
    }
  },
  mockRun: async () => {
    return {
      updated: true,
    };
  },
});

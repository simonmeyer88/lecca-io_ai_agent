import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/hubspot.shared';

export const upsertContact = createAction({
  id: 'hubspot_action_upsert-contact',
  name: 'Upsert Contact',
  description:
    'Creates a new contact or updates an existing one in Hubspot based on email',
  aiSchema: z.object({
    email: z.string().email().describe('The email of the contact'),
    properties: z
      .array(
        z.object({
          field: z.string().describe('The field to set'),
          value: z.string().describe('The value to set'),
        }),
      )
      .describe('The field and value for that field'),
  }),
  inputConfig: [
    createTextInputField({
      id: 'email',
      label: 'Email',
      description: 'The email of the contact to create or update',
      placeholder: 'Add new or existing email',
      required: {
        missingMessage: 'Email is required',
        missingStatus: 'warning',
      },
    }),
    shared.fields.dynamicGetContactProperties,
  ],
  run: async ({ configValue, connection, workspaceId, http }) => {
    const { email, properties: contactProperties } = configValue;

    const url = `https://api.hubapi.com/contacts/v1/contact/createOrUpdate/email/${encodeURIComponent(
      email,
    )}`;

    const properties = contactProperties
      .filter(({ value }) => {
        value = value.trim();

        return value.length > 0;
      })
      .map(({ field, value }) => ({
        property: field,
        value,
      }));

    const data = { properties };

    const result = await http.request({
      method: 'POST',
      url,
      data,
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
      },
      workspaceId,
    });

    if (result?.data?.vid) {
      return result.data;
    } else {
      throw new Error(`Failed to upsert contact: ${result.data?.message}`);
    }
  },
  mockRun: async () => {
    return {
      isNew: true,
      vid: 123456,
    };
  },
});

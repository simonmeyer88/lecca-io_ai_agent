import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/hubspot.shared';

export const createContact = createAction({
  id: 'hubspot_action_create-contact',
  name: 'Create Contact',
  description: 'Creates a new contact in Hubspot',
  inputConfig: [shared.fields.dynamicGetContactProperties],
  aiSchema: z.object({
    properties: z
      .array(
        z.object({
          field: z.string().describe('The field to set'),
          value: z.string().describe('The value to set'),
        }),
      )
      .describe('The field and value for that field'),
  }),
  run: async ({ configValue, connection, workspaceId, http }) => {
    const url = 'https://api.hubapi.com/contacts/v1/contact';

    const properties = configValue.properties.map(({ field, value }) => ({
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
      throw new Error(`Failed to create contact: ${result.data?.message}`);
    }
  },
  mockRun: async () => {
    return {
      vid: 123,
      'canonical-vid': 123,
      'merged-vids': [],
      'portal-id': 123,
      properties: {
        firstname: { value: 'John' },
        lastname: { value: 'Doe' },
        email: { value: 'test@test.com' },
        company: { value: 'Acme' },
        phone: { value: '123-456-7890' },
      },
    };
  },
});

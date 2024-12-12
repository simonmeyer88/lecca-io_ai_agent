import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-contacts.shared';

export const listContacts = createAction({
  id: 'google-contacts_action_list-contacts',
  name: 'List Contacts',
  description: 'List all contacts',
  aiSchema: z.object({
    pageSize: z
      .number()
      .min(1)
      .max(1000)
      .nullable()
      .optional()
      .default(100)
      .describe('The number of contacts to retrieve per page. Max is 1000.'),
    pageToken: z
      .string()
      .nullable()
      .optional()
      .describe(
        'Token for retrieving the next page of results. Leave empty to start from the first page.',
      ),
  }),
  inputConfig: [
    {
      id: 'pageSize',
      label: 'Page Size',
      description: 'The number of contacts to retrieve per page.',
      inputType: 'number',
      placeholder: 'Enter page size (1-1000)',
      numberOptions: {
        min: 1,
        max: 1000,
      },
      defaultValue: 100,
    },
    {
      id: 'pageToken',
      label: 'Page Token',
      description:
        'Token for retrieving the next page of results. Leave empty to start from the first page.',
      inputType: 'text',
      placeholder: 'Enter page token',
    },
  ],
  run: async ({ configValue, connection }) => {
    const googleContacts = shared.googleContacts({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { pageSize, pageToken } = configValue;

    const contacts = await googleContacts.people.connections.list({
      resourceName: 'people/me',
      pageSize,
      pageToken,
      personFields: 'names,emailAddresses,phoneNumbers',
    });

    return contacts.data;
  },
  mockRun: async () => {
    return {
      connections: [
        {
          resourceName: 'people/c123456789',
          names: [{ displayName: 'John Doe' }],
          emailAddresses: [{ value: 'john.doe@example.com' }],
          phoneNumbers: [{ value: '+1234567890' }],
        },
        {
          resourceName: 'people/c987654321',
          names: [{ displayName: 'Jane Smith' }],
          emailAddresses: [{ value: 'jane.smith@example.com' }],
          phoneNumbers: [{ value: '+0987654321' }],
        },
      ],
      totalItems: 2,
      totalPeople: 2,
      nextPageToken: 'token_for_next_page',
    };
  },
});

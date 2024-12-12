import { createAction } from '@lecca-io/toolkit';
import { createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-contacts.shared';

export const getContact = createAction({
  id: 'google-contacts_action_get-contact',
  name: 'Get Contact',
  description: 'Retrieves a contact by their resource name.',
  inputConfig: [
    {
      id: 'markdown',
      inputType: 'markdown',
      markdown:
        'Get Contact retrieves a contact by their resource name. This is an id like people/c123456789.',
      description: '',
      label: '',
    },
    createTextInputField({
      id: 'resource-name',
      label: 'Resource Name',
      description: 'The resource name of the contact to retrieve.',
      placeholder: 'Enter resource name',
      required: {
        missingMessage: 'Resource name is required',
        missingStatus: 'warning',
      },
    }),
  ],
  aiSchema: z.object({
    'resource-name': z
      .string()
      .min(1)
      .describe('The resource name of the contact to retrieve'),
  }),
  run: async ({ configValue, connection }) => {
    const googleContacts = shared.googleContacts({
      accessToken: connection?.accessToken ?? '',
      refreshToken: connection?.refreshToken ?? '',
    });

    const { 'resource-name': resourceName } = configValue;

    const contact = await googleContacts.people.get({
      resourceName,
      personFields: 'names,emailAddresses,phoneNumbers',
    });

    return contact.data;
  },
  mockRun: async () => {
    return {
      resourceName: 'people/c123456789',
      names: [{ displayName: 'John Doe' }],
      emailAddresses: [{ value: 'john.doe@example.com' }],
      phoneNumbers: [{ value: '+1234567890' }],
    };
  },
});

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { GoogleContacts } from '../google-contacts.app';
import { z } from 'zod';

export class GetContact extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleContacts;
  id() {
    return 'google-contacts_action_get-contact';
  }
  name() {
    return 'Get Contact';
  }
  description() {
    return 'Retrieves a contact by their resource name.';
  }
  aiSchema() {
    return z.object({
      'resource-name': z
        .string()
        .min(1)
        .describe('The resource name of the contact to retrieve'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        id: 'markdown',
        inputType: 'markdown',
        markdown:
          'Get Contact retrieves a contact by their resource name. This is an id like people/c123456789.',
        description: '',
        label: '',
      },
      {
        id: 'resource-name',
        label: 'Resource Name',
        description: 'The resource name of the contact to retrieve.',
        inputType: 'text',
        placeholder: 'Enter resource name',
        required: {
          missingMessage: 'Resource name is required',
          missingStatus: 'warning',
        },
      },
    ];
  }

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<any> {
    const googleContacts = await this.app.googleContacts({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { 'resource-name': resourceName } = configValue;

    const contact = await googleContacts.people.get({
      resourceName,
      personFields: 'names,emailAddresses,phoneNumbers',
    });

    return contact.data;
  }

  async mockRun(): Promise<any> {
    return {
      resourceName: 'people/c123456789',
      names: [{ displayName: 'John Doe' }],
      emailAddresses: [{ value: 'john.doe@example.com' }],
      phoneNumbers: [{ value: '+1234567890' }],
    };
  }
}

type ConfigValue = z.infer<ReturnType<GetContact['aiSchema']>>;

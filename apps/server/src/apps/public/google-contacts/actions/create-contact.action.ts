import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { GoogleContacts } from '../google-contacts.app';
import { z } from 'zod';

export class CreateContact extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleContacts;
  id() {
    return 'google-contacts_action_create-contact';
  }
  name() {
    return 'Create Contact';
  }
  description() {
    return 'Creates a new contact with provided details.';
  }
  aiSchema() {
    return z.object({
      name: z.string().min(1).describe('The name of the new contact.'),
      email: z
        .string()
        .email()
        .nullable()
        .optional()
        .describe('The email address of the new contact.'),
      phone: z
        .string()
        .nullable()
        .optional()
        .describe('The phone number of the new contact.'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        id: 'name',
        label: 'Contact Name',
        description: 'The name of the new contact.',
        inputType: 'text',
        placeholder: 'Enter contact name',
        required: {
          missingMessage: 'Contact name is required',
          missingStatus: 'warning',
        },
      },
      {
        id: 'email',
        label: 'Email Address',
        description: '',
        inputType: 'text',
        placeholder: 'Enter email address',
      },
      {
        id: 'phone',
        label: 'Phone Number',
        description: '',
        inputType: 'text',
        placeholder: 'Enter phone number',
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

    const { name, email, phone } = configValue;

    const newContact = await googleContacts.people.createContact({
      requestBody: {
        names: [{ displayName: name }],
        emailAddresses: email ? [{ value: email }] : undefined,
        phoneNumbers: phone ? [{ value: phone }] : undefined,
      },
    });

    return newContact.data;
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

type ConfigValue = z.infer<ReturnType<CreateContact['aiSchema']>>;

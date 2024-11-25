import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { Hubspot } from '../hubspot.app';
import { z } from 'zod';

export class UpsertContact extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Hubspot;

  id() {
    return 'hubspot_action_upsert-contact';
  }

  name() {
    return 'Upsert Contact';
  }

  description() {
    return 'Creates a new contact or updates an existing one in Hubspot based on email';
  }

  aiSchema() {
    return z.object({
      email: z.string().email().describe('The email of the contact'),
      properties: z
        .array(
          z.object({
            field: z.string().min(1).describe('The field to set'),
            value: z.string().min(1).describe('The value to set'),
          }),
        )
        .min(1)
        .describe('The field and value for that field'),
    });
  }

  inputConfig(): InputConfig[] {
    return [
      {
        id: 'email',
        label: 'Email',
        inputType: 'text',
        description: 'The email of the contact to create or update',
        placeholder: 'Add new or existing email',
        required: {
          missingMessage: 'Email is required',
          missingStatus: 'warning',
        },
      },
      this.app.dynamicGetContactProperties(),
    ];
  }

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<ResponseType> {
    const { email, properties: contactProperties } = configValue;

    const url = `https://api.hubapi.com/contacts/v1/contact/createOrUpdate/email/${encodeURIComponent(email)}`;

    const properties = contactProperties.map(({ field, value }) => ({
      property: field,
      value,
    }));

    const data = { properties };

    const result = await this.app.http.loggedRequest({
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
  }

  async mockRun(): Promise<ResponseType> {
    return {
      isNew: true,
      vid: 123456,
    };
  }
}

type ResponseType = {
  isNew: boolean;
  vid: number;
};

type ConfigValue = z.infer<ReturnType<UpsertContact['aiSchema']>>;

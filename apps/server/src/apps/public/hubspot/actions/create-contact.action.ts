import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Hubspot } from '../hubspot.app';

export class CreateContact extends Action {
  app: Hubspot;

  id = 'hubspot_action_create-contact';
  name = 'Create Contact';
  description = 'Creates a new contact in Hubspot';
  aiSchema = z.object({
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
  inputConfig: InputConfig[] = [this.app.dynamicGetContactProperties()];

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<ResponseType> {
    const url = 'https://api.hubapi.com/contacts/v1/contact';

    const properties = configValue.properties.map(({ field, value }) => ({
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
      throw new Error(`Failed to create contact: ${result.data?.message}`);
    }
  }

  async mockRun(): Promise<ResponseType> {
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
  }
}

type ResponseType = {
  vid: number;
  'canonical-vid': number;
  'merged-vids': number[];
  'portal-id': number;
  properties: {
    firstname: { value: string };
    lastname: { value: string };
    email: { value: string };
    company: { value: string };
    phone: { value: string };
  };
};

type ConfigValue = z.infer<CreateContact['aiSchema']>;

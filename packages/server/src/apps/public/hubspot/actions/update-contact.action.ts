import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Hubspot } from '../hubspot.app';

export class UpdateContact extends Action {
  app: Hubspot;

  id = 'hubspot_action_update-contact';
  name = 'Update Contact';
  description = 'Updates an existing contact in Hubspot';
  aiSchema = z.object({
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
  });
  inputConfig: InputConfig[] = [
    {
      id: 'identifier',
      label: 'Contact Email',
      description: 'The unique identifier of the contact (e.g., email or VID)',
      placeholder: 'Enter a contact email or VID',
      inputType: 'text',
      required: {
        missingMessage: 'Please provide an identifier',
        missingStatus: 'warning',
      },
    },
    this.app.dynamicGetContactProperties(),
  ];

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<ResponseType> {
    const { identifier, properties } = configValue;

    // Assuming the identifier is an email for this example; if not, update the URL accordingly
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

    const result = await this.app.http.loggedRequest({
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
  }

  async mockRun(): Promise<ResponseType> {
    return {
      updated: true,
    };
  }
}

type ResponseType = {
  updated: boolean;
};

type ConfigValue = z.infer<UpdateContact['aiSchema']>;

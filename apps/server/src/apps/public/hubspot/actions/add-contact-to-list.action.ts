import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Hubspot } from '../hubspot.app';

export class AddContactToList extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Hubspot;
  id() {
    return 'hubspot_action_add-contact-to-list';
  }
  name() {
    return 'Add Contact to List';
  }
  description() {
    return 'Adds a contact to a static list in Hubspot';
  }
  aiSchema() {
    return z.object({
      email: z.string().email().describe('The email of the contact'),
      listId: z
        .string()
        .min(1)
        .describe('The ID of the list to add the contact to'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        id: 'email',
        label: 'Contact Email',
        description: '',
        inputType: 'text',
        placeholder: 'Add an email',
        required: {
          missingMessage: 'Email is required',
          missingStatus: 'warning',
        },
      },
      this.app.dynamicGetStaticContactLists(),
      {
        id: 'markdown1',
        inputType: 'markdown',
        label: '',
        description: '',
        markdown: 'Not that you cannot add a contact to a dynamic list',
      },
    ];
  }

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<ResponseType> {
    const { listId, email } = configValue;

    const url = `https://api.hubapi.com/contacts/v1/lists/${listId}/add`;

    const data = {
      emails: [email],
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
      return result.data;
    } else {
      throw new Error(`Failed to add contact to list: ${result?.data?.error}`);
    }
  }

  async mockRun(): Promise<ResponseType> {
    return {
      updated: ['12999999999'],
      discarded: [],
      invalidVids: [],
      invalidEmails: [],
    };
  }
}

type ResponseType = {
  updated: string[];
  discarded: string[];
  invalidVids: string[];
  invalidEmails: string[];
};

type ConfigValue = z.infer<ReturnType<AddContactToList['aiSchema']>>;

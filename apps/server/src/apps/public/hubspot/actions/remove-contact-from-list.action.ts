import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Hubspot } from '../hubspot.app';

export class RemoveContactFromList extends Action {
  app: Hubspot;
  id = 'hubspot_action_remove-contact-from-list';
  name = 'Remove Contact from List';
  description = 'Removes a contact from a static list in Hubspot';
  aiSchema = z.object({
    email: z.string().email().describe('The email of the contact'),
    listId: z
      .string()
      .min(1)
      .describe('The ID of the list to remove the contact from'),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'email',
      label: 'Contact Email',
      description: '',
      inputType: 'text',
      placeholder: 'Enter the contact email to remove',
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
      markdown: 'You cannot remove a contact from a dynamic list',
    },
  ];

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<ResponseType> {
    const { listId, email } = configValue;

    const url = `https://api.hubapi.com/contacts/v1/lists/${listId}/remove`;

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
      throw new Error(
        `Failed to remove contact from list: ${result?.data?.error}`,
      );
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

type ConfigValue = z.infer<RemoveContactFromList['aiSchema']>;

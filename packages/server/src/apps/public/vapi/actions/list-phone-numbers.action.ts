import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Vapi } from '../vapi.app';

export class ListPhoneNumbers extends Action {
  app: Vapi;

  id = 'vapi_action_list-phone-numbers';
  name = 'List Phone Numbers';
  description = 'Retrieve the list of VAPI phone numbers';
  aiSchema = z.object({});
  inputConfig: InputConfig[] = [];

  async run({
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
    const url = 'https://api.vapi.ai/phone-number';

    // Fetch the list of VAPI phone numbers using HTTP GET
    const result = await this.app.http.loggedRequest({
      method: 'GET',
      url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${connection.apiKey}`,
      },
      workspaceId,
    });

    return {
      phoneNumbers: result.data,
    } as any;
  }

  async mockRun(): Promise<Response> {
    return mock;
  }
}

const mock = {
  phoneNumbers: [
    {
      id: 'phone_1_id',
      name: 'Phone 1',
      number: '+1234567890',
      orgId: 'some-org-id',
      createdAt: '2023-11-07T05:31:56Z',
      updatedAt: '2023-11-07T05:31:56Z',
    },
  ],
};

type ConfigValue = z.infer<ListPhoneNumbers['aiSchema']>;

type Response = typeof mock;

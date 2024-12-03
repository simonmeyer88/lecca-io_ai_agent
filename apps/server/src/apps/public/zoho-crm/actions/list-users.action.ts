import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { ZohoCrm } from '../zoho-crm.app';

export class ListUsers extends Action {
  app: ZohoCrm;
  id = 'zoho-crm_action_list-users';
  name = 'List Users';
  description = 'Retrieve a list of users.';
  aiSchema = z.object({
    page: z.number().default(1).describe('Page number for user results'),
    perPage: z
      .number()
      .max(100)
      .default(10)
      .describe('Number of users per page (Max: 100)'),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'page',
      label: 'Page Number',
      description: 'The page number to retrieve',
      inputType: 'number',
      numberOptions: { min: 1 },
      defaultValue: 1,
    },
    {
      id: 'perPage',
      label: 'Users per Page',
      description: 'Number of users to retrieve per page (Max: 100)',
      inputType: 'number',
      numberOptions: { min: 1, max: 100, step: 1 },
      defaultValue: 50,
    },
  ];

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>) {
    const { page, perPage } = configValue;
    const url = `https://www.zohoapis.com/crm/v2/users?page=${page}&per_page=${perPage}`;

    const response = await this.app.http.loggedRequest({
      method: 'GET',
      url,
      headers: {
        Authorization: `Zoho-oauthtoken ${connection.accessToken}`,
      },
      workspaceId,
    });

    return {
      data: response.data.users.map((user: any) => ({
        id: user.id,
        firstName: user.first_name,
        lastName: user.last_name,
        email: user.email,
        role: user.role.name,
        status: user.status,
      })),
      info: response.data.info,
    };
  }

  async mockRun(): Promise<typeof mock> {
    return mock;
  }
}

const mock = {
  data: [
    {
      id: '000000000000',
      firstName: 'John',
      lastName: 'Doe',
      email: 'john.doe@example.com',
      role: 'Sales Manager',
      status: 'active',
    },
    {
      id: '000000000000',
      firstName: 'Jane',
      lastName: 'Smith',
      email: 'jane.smith@example.com',
      role: 'Support Agent',
      status: 'inactive',
    },
  ],
  info: {
    page: 1,
    count: 1,
    sort_by: 'id',
    per_page: 20,
    sort_order: 'desc',
    more_records: false,
  },
};

type ConfigValue = z.infer<ListUsers['aiSchema']>;

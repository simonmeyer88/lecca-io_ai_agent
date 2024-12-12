import { createAction, createNumberInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const listUsers = createAction({
  id: 'zoho-crm_action_list-users',
  name: 'List Users',
  description: 'Retrieve a list of users.',
  needsConnection: true,
  inputConfig: [
    createNumberInputField({
      id: 'page',
      label: 'Page Number',
      description: 'The page number to retrieve',
      defaultValue: 1,
      numberOptions: { min: 1 },
    }),
    createNumberInputField({
      id: 'perPage',
      label: 'Users per Page',
      description: 'Number of users to retrieve per page (Max: 100)',
      defaultValue: 50,
      numberOptions: { min: 1, max: 100, step: 1 },
    }),
  ],
  aiSchema: z.object({
    page: z.number().default(1).describe('Page number for user results'),
    perPage: z
      .number()
      .max(100)
      .default(10)
      .describe('Number of users per page (Max: 100)'),
  }),
  run: async ({ configValue, connection, workspaceId, http }) => {
    const { page, perPage } = configValue;
    const url = `https://www.zohoapis.com/crm/v2/users?page=${page}&per_page=${perPage}`;

    const response = await http.request({
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
  },
  mockRun: async () => ({
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
  }),
});

// Assuming ZohoCRM app is defined
import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { ZohoCrm } from '../zoho-crm.app';

export class AddUser extends Action {
  app: ZohoCrm;

  id = 'zoho-crm_action_add-user';
  name = 'Add User';
  description = 'Add a new user to ZohoCRM.';
  aiSchema = z.object({
    firstName: z.string().min(1).describe('The first name of the user to add'),
    lastName: z.string().min(1).describe('The last name of the user to add'),
    email: z.string().email().describe('The email of the user to add'),
    role: z.string().min(1).describe('The role ID to assign to the user'),
    profile: z.string().min(1).describe('The profile ID to assign to the user'),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'firstName',
      label: 'First Name',
      description: 'The first name of the user',
      inputType: 'text',
      required: {
        missingMessage: 'First name is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'lastName',
      label: 'Last Name',
      description: 'The last name of the user',
      inputType: 'text',
      required: {
        missingMessage: 'Last name is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'email',
      label: 'Email',
      description: 'The email of the user',
      inputType: 'text',
      required: {
        missingMessage: 'Email is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'role',
      label: 'Role',
      description: 'The role of the user',
      inputType: 'dynamic-select',
      _getDynamicValues: async ({ connection, workspaceId }) => {
        const url = `https://www.zohoapis.com/crm/v2/settings/roles`;

        const response = await this.app.http.loggedRequest({
          method: 'GET',
          url,
          headers: {
            Authorization: `Zoho-oauthtoken ${connection.accessToken}`,
          },
          workspaceId,
        });

        return response.data.roles.map((role: any) => ({
          label: role.display_label,
          value: role.id,
        }));
      },
      required: {
        missingMessage: 'Role is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'profile',
      label: 'Profile',
      description: 'The profile of the user',
      inputType: 'dynamic-select',
      _getDynamicValues: async ({ connection, workspaceId }) => {
        const url = `https://www.zohoapis.com/crm/v7/settings/profiles`;

        const response = await this.app.http.loggedRequest({
          method: 'GET',
          url,
          headers: {
            Authorization: `Zoho-oauthtoken ${connection.accessToken}`,
          },
          workspaceId,
        });

        return response.data.profiles.map((profile: any) => ({
          label: profile.display_label,
          value: profile.id,
        }));
      },
      required: {
        missingMessage: 'Profile is required',
        missingStatus: 'warning',
      },
    },
  ];

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>) {
    const url = `https://www.zohoapis.com/crm/v2/users`;
    const payload = {
      users: [
        {
          first_name: configValue.firstName,
          last_name: configValue.lastName,
          email: configValue.email,
          role: configValue.role,
          profile: configValue.profile,
        },
      ],
    };

    const response = await this.app.http.loggedRequest({
      method: 'POST',
      url,
      data: payload,
      headers: {
        Authorization: `Zoho-oauthtoken ${connection.accessToken}`,
      },
      workspaceId,
    });

    const { data } = response;
    const singleUserAdded = data.users[0];

    if (!singleUserAdded) {
      throw new Error('Something went wrong adding the user');
    } else if (singleUserAdded.status === 'error') {
      throw new Error(singleUserAdded.message ?? 'Failed to add user');
    }

    return response.data.users[0];
  }

  async mockRun(): Promise<typeof mock> {
    return mock as any;
  }
}

const mock = {
  code: 'SUCCESS',
  details: {
    id: '0000096000000504001',
  },
  message: 'User added',
  status: 'success',
};

type ConfigValue = z.infer<AddUser['aiSchema']>;

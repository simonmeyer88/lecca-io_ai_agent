import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const addUser = createAction({
  id: 'zoho-crm_action_add-user',
  name: 'Add User',
  description: 'Add a new user to ZohoCRM.',
  needsConnection: true,
  inputConfig: [
    createTextInputField({
      id: 'firstName',
      label: 'First Name',
      description: 'The first name of the user',
      required: {
        missingMessage: 'First name is required',
        missingStatus: 'warning',
      },
    }),
    createTextInputField({
      id: 'lastName',
      label: 'Last Name',
      description: 'The last name of the user',
      required: {
        missingMessage: 'Last name is required',
        missingStatus: 'warning',
      },
    }),
    createTextInputField({
      id: 'email',
      label: 'Email',
      description: 'The email of the user',
      required: {
        missingMessage: 'Email is required',
        missingStatus: 'warning',
      },
    }),
    {
      id: 'role',
      label: 'Role',
      description: 'The role of the user',
      inputType: 'dynamic-select',
      _getDynamicValues: async ({ connection, workspaceId, http }) => {
        const url = `https://www.zohoapis.com/crm/v2/settings/roles`;

        const response = await http.request({
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
      _getDynamicValues: async ({ connection, workspaceId, http }) => {
        const url = `https://www.zohoapis.com/crm/v7/settings/profiles`;

        const response = await http.request({
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
  ],
  aiSchema: z.object({
    firstName: z.string().min(1).describe('The first name of the user to add'),
    lastName: z.string().min(1).describe('The last name of the user to add'),
    email: z.string().email().describe('The email of the user to add'),
    role: z.string().min(1).describe('The role ID to assign to the user'),
    profile: z.string().min(1).describe('The profile ID to assign to the user'),
  }),
  run: async ({ configValue, connection, workspaceId, http }) => {
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

    const response = await http.request({
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
  },
  mockRun: async () => ({
    code: 'SUCCESS',
    details: {
      id: '0000096000000504001',
    },
    message: 'User added',
    status: 'success',
  }),
});

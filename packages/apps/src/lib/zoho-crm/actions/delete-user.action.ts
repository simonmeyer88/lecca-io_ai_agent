import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/zoho-crm.shared';

export const deleteUser = createAction({
  id: 'zoho-crm_action_delete-user',
  name: 'Delete User',
  description: 'Delete a user from by user ID.',
  inputConfig: [shared.fields.dynamicGetUsers],
  aiSchema: z.object({
    userId: z
      .string()
      .min(1)
      .describe('The ID of the user to delete from ZohoCRM'),
  }),

  run: async ({ configValue, connection, workspaceId, http }) => {
    const { userId } = configValue;
    const url = `https://www.zohoapis.com/crm/v2/users/${userId}`;

    const response = await http.request({
      method: 'DELETE',
      url,
      headers: {
        Authorization: `Zoho-oauthtoken ${connection.accessToken}`,
      },
      workspaceId,
    });

    if (response.data?.users?.length === 0) {
      throw new Error(`No user was deleted`);
    } else if (response.data?.users[0].status === 'error') {
      throw new Error(
        `${response.data?.users[0].message ?? 'Error deleting user'}`,
      );
    } else {
      return {
        message: `User with ID ${userId} has been deleted successfully.`,
      };
    }
  },

  mockRun: async () => {
    return {
      message: `User with ID 0000000000 has been deleted successfully.`,
    };
  },
});

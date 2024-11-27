import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { ZohoCrm } from '../zoho-crm.app';

export class DeleteUser extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: ZohoCrm;
  id = 'zoho-crm_action_delete-user';
  name = 'Delete User';
  description = 'Delete a user from by user ID.';
  aiSchema = z.object({
    userId: z
      .string()
      .min(1)
      .describe('The ID of the user to delete from ZohoCRM'),
  });
  inputConfig: InputConfig[] = [this.app.dynamicGetUsers()];

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>) {
    const { userId } = configValue;
    const url = `https://www.zohoapis.com/crm/v2/users/${userId}`;

    const response = await this.app.http.loggedRequest({
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
  }

  async mockRun(): Promise<{ message: string }> {
    return {
      message: `User with ID 0000000000 has been deleted successfully.`,
    };
  }
}

type ConfigValue = z.infer<DeleteUser['aiSchema']>;

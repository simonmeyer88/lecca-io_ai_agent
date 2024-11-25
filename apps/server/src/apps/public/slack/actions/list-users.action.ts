import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { Slack } from '../slack.app';
import { z } from 'zod';

export class ListUsers extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Slack;
  id() {
    return 'slack_action_list-users';
  }
  name() {
    return 'List Users';
  }
  description() {
    return 'Lists all users in a Slack workspace';
  }
  aiSchema() {
    return z.object({});
  }
  inputConfig(): InputConfig[] {
    return [];
  }

  async run({
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<ResponseType> {
    const users: User[] = [];

    let cursor;
    do {
      const url = 'https://slack.com/api/users.list';
      const data = new URLSearchParams({
        limit: '200',
        cursor: cursor ?? '',
      }) as any;

      const response = await this.app.http.loggedRequest({
        method: 'POST',
        url,
        data,
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Bearer ${connection.accessToken}`,
        },
        workspaceId,
      });

      if (response?.data?.ok !== true) {
        throw new Error('Failed to fetch users');
      }

      users.push(
        ...response.data.members
          .filter((member: any) => !member.deleted)
          .map((member: any) => ({
            id: member.id,
            name: member.real_name,
            is_bot: member.is_bot,
            is_admin: member.is_admin,
            is_owner: member.is_owner,
          })),
      );

      cursor = response.data.response_metadata.next_cursor;
    } while (cursor !== '' && users.length < 600);

    return { users };
  }

  async mockRun(): Promise<ResponseType> {
    return {
      users: [
        {
          id: 'user-id-1',
          name: 'John Doe',
          is_bot: false,
          is_admin: true,
          is_owner: false,
        },
        {
          id: 'user-id-2',
          name: 'Jane Smith',
          is_bot: false,
          is_admin: false,
          is_owner: true,
        },
      ],
    };
  }
}

type User = {
  id: string;
  name: string;
  is_bot: boolean;
  is_admin: boolean;
  is_owner: boolean;
};

type ResponseType = {
  users: User[];
};

type ConfigValue = z.infer<ReturnType<ListUsers['aiSchema']>>;

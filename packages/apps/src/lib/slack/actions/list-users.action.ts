import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

export const listUsers = createAction({
  id: 'slack_action_list-users',
  name: 'List Users',
  description: 'Lists all users in a Slack workspace',
  inputConfig: [],
  aiSchema: z.object({}),
  run: async ({ connection, workspaceId, http }) => {
    const users: User[] = [];
    let cursor;

    do {
      const url = 'https://slack.com/api/users.list';
      const data = new URLSearchParams({
        limit: '200',
        cursor: cursor ?? '',
      }) as any;

      const response = await http.request({
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
  },
  mockRun: async (): Promise<Response> => {
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
  },
});

type User = {
  id: string;
  name: string;
  is_bot: boolean;
  is_admin: boolean;
  is_owner: boolean;
};

type Response = {
  users: User[];
};

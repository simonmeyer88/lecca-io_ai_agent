import { createDynamicSelectInputField } from '@lecca-io/toolkit';

export const shared = {
  fields: {
    dynamicSelectUser: createDynamicSelectInputField({
      id: 'userId',
      label: 'User',
      description: 'Select a user',
      _getDynamicValues: async ({ connection, workspaceId, http }) => {
        const users: { label: string; value: string }[] = [];

        let cursor;
        do {
          const url = 'https://slack.com/api/users.list';
          const data = new URLSearchParams({
            limit: '200',
            cursor: cursor ?? '',
          });

          const response = await http.request({
            method: 'POST',
            url,
            data,
            headers: {
              Authorization: `Bearer ${connection.accessToken}`,
            },
            workspaceId,
          });

          if (response.data.ok !== true) {
            throw new Error('Failed to fetch users');
          }

          users.push(
            ...response.data.members
              .filter((member: any) => !member.deleted)
              .map((member: any) => ({
                label: member.real_name,
                value: member.id,
              })),
          );

          cursor = response.data.response_metadata.next_cursor;
        } while (cursor !== '' && users.length < 600);

        return users;
      },
      required: {
        missingMessage: 'Please select a user',
        missingStatus: 'warning',
      },
    }),
    dynamicSelectChannel: createDynamicSelectInputField({
      id: 'channelId',
      label: 'Channel',
      description: '',
      _getDynamicValues: async ({ connection, workspaceId, http }) => {
        const channels: { label: string; value: string }[] = [];

        let cursor;
        do {
          const url = 'https://slack.com/api/conversations.list';
          const data = new URLSearchParams({
            limit: '200',
            cursor: cursor ?? '',
            types: 'public_channel,private_channel', // Include both public and private channels
          });

          const response = await http.request({
            method: 'POST',
            url,
            data,
            headers: {
              Authorization: `Bearer ${connection.accessToken}`,
            },
            workspaceId,
          });

          if (response.data.ok !== true) {
            throw new Error('Failed to fetch channels');
          }

          channels.push(
            ...response.data.channels
              .filter((channel: any) => !channel.is_archived)
              .map((channel: any) => ({
                label: channel.name,
                value: channel.id,
              })),
          );

          cursor = response.data.response_metadata.next_cursor;
        } while (cursor !== '' && channels.length < 600);

        return channels;
      },
      required: {
        missingMessage: 'Please select a channel',
        missingStatus: 'warning',
      },
    }),
  },
};

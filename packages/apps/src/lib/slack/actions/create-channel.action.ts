import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const createChannel = createAction({
  id: 'slack_action_create-channel',
  name: 'Create Channel',
  description: 'Creates a new channel.',
  inputConfig: [
    createTextInputField({
      id: 'name',
      label: 'Channel Name',
      description:
        'Channel names can’t contain capital letters, spaces, or punctuation. Use dashes to separate words.',
      placeholder: 'Add a name',
      required: {
        missingMessage: 'Name is required',
        missingStatus: 'warning',
      },
    }),
  ],
  aiSchema: z.object({
    name: z
      .string()
      .describe(
        'The name of the new channel. Cannot contain capital letters, spaces, or punctuation. Use dashes to separate words.',
      ),
    private: z
      .enum(['true', 'false'])
      .describe('True if the channel should be private, false otherwise'),
  }),
  run: async ({ configValue, connection, workspaceId, http }) => {
    const url = 'https://slack.com/api/conversations.create';
    const data = new URLSearchParams({
      name: configValue.name,
      is_private: configValue.private,
    });

    const result = await http.request({
      method: 'POST',
      url,
      data,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${connection.accessToken}`,
      },
      workspaceId,
    });

    if (result?.data?.ok) {
      return result.data;
    } else {
      throw new Error(`Failed to create channel: ${result.data?.error}`);
    }
  },
  mockRun: async () => {
    return {
      ok: true,
      channel: {
        id: 'channel-id',
        name: 'new-channel-name',
        is_channel: true,
        is_group: false,
        is_im: false,
        created: 1626780000,
        is_archived: false,
        is_general: false,
        unlinked: 0,
        name_normalized: 'new-channel-name',
        is_shared: false,
        is_ext_shared: false,
        is_org_shared: false,
        pending_shared: [],
        is_pending_ext_shared: false,
        is_member: true,
        is_private: false,
        is_mpim: false,
        last_read: '0000000000.000000',
        latest: null,
        unread_count: 0,
        unread_count_display: 0,
        members: [],
        topic: {
          value: '',
          creator: '',
          last_set: 0,
        },
        shared_team_ids: ['id1'],
        purpose: {
          value: '',
          creator: '',
          last_set: 0,
        },
        priority: 0,
      },
    };
  },
});

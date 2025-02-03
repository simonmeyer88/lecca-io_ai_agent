import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/slack.shared';

export const getThreadMessages = createAction({
  id: 'slack_action_get-thread-messages',
  name: 'Get Thread Messages',
  description: 'Fetches messages from a Slack thread',
  inputConfig: [
    shared.fields.dynamicSelectChannel,
    {
      id: 'threadTs',
      label: 'Thread Timestamp',
      description: 'Timestamp of the original message in the thread',
      inputType: 'text',
      placeholder: 'Enter the original message timestamp (ts)',
      required: {
        missingMessage: 'Thread timestamp is required',
        missingStatus: 'warning',
      },
    },
  ],
  aiSchema: z.object({
    channelId: z
      .string()
      .describe('The ID of the channel where the thread exists'),
    threadTs: z
      .string()
      .describe(
        'The timestamp of the original message in the thread (ts field)',
      ),
  }),
  run: async ({ configValue, connection, workspaceId, http }) => {
    const url = `https://slack.com/api/conversations.replies`;
    const params = new URLSearchParams({
      channel: configValue.channelId,
      ts: configValue.threadTs,
    });

    const result = await http.request({
      method: 'GET',
      url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${connection?.accessToken}`,
      },
      params,
      workspaceId,
    });

    if (result?.data?.ok) {
      return result.data;
    } else {
      throw new Error(`Failed to fetch thread messages: ${result.data?.error}`);
    }
  },
  mockRun: async () => {
    return {
      ok: true,
      messages: [
        {
          type: 'message',
          user: 'U123456789',
          text: 'This is the first message in the thread',
          ts: '1503435956.000247',
          thread_ts: '1503435956.000247',
          reply_count: 2,
          replies: [
            {
              user: 'U987654321',
              ts: '1503435956.000300',
            },
            {
              user: 'U123456789',
              ts: '1503435956.000400',
            },
          ],
          subscribed: true,
          last_read: '1503435956.000400',
          unread_count: 0,
        },
      ],
      has_more: false,
    };
  },
});

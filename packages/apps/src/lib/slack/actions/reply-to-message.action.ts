import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/slack.shared';

export const replyToMessage = createAction({
  id: 'slack_action_reply-to-message',
  name: 'Reply to Message',
  description: 'Replies to a message in a Slack thread',
  aiSchema: z.object({
    channelId: z
      .string()
      .min(1)
      .describe('The ID of the channel where the message was sent'),
    threadTs: z
      .string()
      .min(1)
      .describe(
        'The timestamp of the message to reply to. Indicated by the ts field in the message object',
      ),
    message: z.string().min(1).describe('The message to send as a reply'),
  }),
  inputConfig: [
    shared.fields.dynamicSelectChannel,
    {
      id: 'threadTs',
      label: 'Thread Timestamp',
      description: 'Timestamp of the original message to reply to',
      inputType: 'text',
      placeholder: 'Enter message timestamp (ts)',
      required: {
        missingMessage: 'Thread timestamp is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'message',
      label: 'Message',
      description: 'Message to send as a reply',
      inputType: 'text',
      placeholder: 'Add a reply message',
      required: {
        missingMessage: 'Message is required',
        missingStatus: 'warning',
      },
    },
  ],
  run: async ({ configValue, connection, workspaceId, http }) => {
    const url = 'https://slack.com/api/chat.postMessage';

    const data = new URLSearchParams({
      text: configValue.message,
      channel: configValue.channelId,
      thread_ts: configValue.threadTs,
    });

    const result = await http.request({
      method: 'POST',
      url,
      data,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${connection?.accessToken}`,
      },
      workspaceId,
    });

    if (result?.data?.ok) {
      return result.data;
    } else {
      throw new Error(`Failed to reply to message: ${result.data?.error}`);
    }
  },
  mockRun: async () => {
    return {
      ok: true,
      channel: 'channel-id',
      ts: '0000000000.000000',
      message: {
        user: 'user-id',
        type: 'message',
        ts: '0000000000.000000',
        bot_id: 'bot-id',
        app_id: 'app-id',
        text: 'Reply message text',
        team: 'team-id',
        bot_profile: {
          id: 'bot-id',
          app_id: 'app-id',
          name: 'Bot Name',
          icons: [],
          deleted: false,
          updated: 1718565923,
          team_id: 'team-id',
        },
        blocks: [],
      },
    };
  },
});

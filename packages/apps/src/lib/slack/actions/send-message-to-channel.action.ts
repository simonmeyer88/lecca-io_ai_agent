import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/slack.shared';

export const sendMessageToChannel = createAction({
  id: 'slack_action_send-message-to-channel',
  name: 'Send Message to Channel',
  description: 'Sends a message to a Slack channel',
  aiSchema: z.object({
    channelId: z
      .string()
      .min(1)
      .describe('The ID of the channel to send the message to'),
    message: z.string().min(1).describe('The message to send to the channel'),
  }),
  inputConfig: [
    {
      id: 'markdown',
      inputType: 'markdown',
      label: '',
      description: '',
      markdown: `Make sure to invite ${process.env.PLATFORM_NAME} to the channel you want to send a message to. You can do this by typing \`/invite @${process.env.PLATFORM_NAME}\` in the channel.`,
    },
    shared.fields.dynamicSelectChannel,
    createTextInputField({
      id: 'message',
      label: 'Message',
      description: 'Message to send to the channel',
      placeholder: 'Add a message',
      required: {
        missingMessage: 'Message is required',
        missingStatus: 'warning',
      },
    }),
  ],
  run: async ({ configValue, connection, workspaceId, http }) => {
    const url = 'https://slack.com/api/chat.postMessage';

    const data = new URLSearchParams({
      text: configValue.message,
      channel: configValue.channelId,
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
      throw new Error(`Failed to send message: ${result.data?.error}`);
    }
  },
  mockRun: async () => ({
    ok: true,
    channel: 'channel-id',
    ts: '0000000000.000000',
    message: {
      user: 'user-id',
      type: 'message',
      ts: '0000000000.000000',
      bot_id: 'bot-id',
      app_id: 'app-id',
      text: 'Message text',
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
  }),
});

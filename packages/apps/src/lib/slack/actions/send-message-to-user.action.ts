import { createAction } from '@lecca-io/toolkit';
import { createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/slack.shared';

export const sendMessageToUser = createAction({
  id: 'slack_action_send-message-to-user',
  name: 'Send Message to User',
  description: 'Sends a message to a user',
  aiSchema: z.object({
    userId: z
      .string()
      .min(1)
      .describe('The ID of the user to send the message to'),
    message: z.string().min(1).describe('The message to send to the user'),
  }),
  inputConfig: [
    shared.fields.dynamicSelectUser,
    createTextInputField({
      id: 'message',
      label: 'Message',
      description: 'Message to send to the user',
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
      channel: configValue.userId,
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
    };
  },
  iconUrl: undefined,
  availableForAgent: undefined,
});

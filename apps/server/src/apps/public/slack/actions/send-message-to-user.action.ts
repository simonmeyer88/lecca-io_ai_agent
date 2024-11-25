import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { Slack } from '../slack.app';
import { z } from 'zod';

export class SendMessageToUser extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Slack;
  id() {
    return 'slack_action_send-message-to-user';
  }
  name() {
    return 'Send Message to User';
  }
  description() {
    return 'Sends a message to a user';
  }
  aiSchema() {
    return z.object({
      userId: z
        .string()
        .min(1)
        .describe('The ID of the user to send the message to'),
      message: z.string().min(1).describe('The message to send to the user'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      this.app.dynamicSelectUser(),
      {
        id: 'message',
        label: 'Message',
        description: 'Message to send to the user',
        inputType: 'text',
        placeholder: 'Add a message',
        required: {
          missingMessage: 'Message is required',
          missingStatus: 'warning',
        },
      },
    ];
  }

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<ResponseType> {
    const url = 'https://slack.com/api/chat.postMessage';

    const data = new URLSearchParams({
      text: configValue.message,
      channel: configValue.userId,
    });

    const result = await this.app.http.loggedRequest({
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
  }

  async mockRun(): Promise<ResponseType> {
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
  }
}

type ResponseType = {
  ok: boolean;
  channel: string;
  ts: string;
  message: {
    user: string;
    type: string;
    ts: string;
    bot_id: string;
    app_id: string;
    text: string;
    team: string;
    bot_profile: {
      id: string;
      app_id: string;
      name: string;
      icons: string[];
      deleted: boolean;
      updated: number;
      team_id: string;
    };
    blocks: unknown[];
  };
};

type ConfigValue = z.infer<ReturnType<SendMessageToUser['aiSchema']>>;

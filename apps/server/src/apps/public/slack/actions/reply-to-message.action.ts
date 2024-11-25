import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { Slack } from '../slack.app';
import { z } from 'zod';

export class ReplyToMessage extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Slack;
  id() {
    return 'slack_action_reply-to-message';
  }
  name() {
    return 'Reply to Message';
  }
  description() {
    return 'Replies to a message in a Slack thread';
  }
  aiSchema() {
    return z.object({
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
    });
  }

  inputConfig(): InputConfig[] {
    return [
      this.app.dynamicSelectChannel(),
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
      channel: configValue.channelId,
      thread_ts: configValue.threadTs,
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
      throw new Error(`Failed to reply to message: ${result.data?.error}`);
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

type ConfigValue = z.infer<ReturnType<ReplyToMessage['aiSchema']>>;

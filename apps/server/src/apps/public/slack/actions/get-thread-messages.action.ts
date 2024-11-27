import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Slack } from '../slack.app';

export class GetThreadMessages extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Slack;

  id = 'slack_action_get-thread-messages';
  name = 'Get Thread Messages';
  description = 'Fetches messages from a Slack thread';
  aiSchema = z.object({
    channelId: z
      .string()
      .min(1)
      .describe('The ID of the channel where the thread exists'),
    threadTs: z
      .string()
      .min(1)
      .describe(
        'The timestamp of the original message in the thread (ts field)',
      ),
  });
  inputConfig: InputConfig[] = [
    this.app.dynamicSelectChannel(),
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
  ];

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<ResponseType> {
    const url = `https://slack.com/api/conversations.replies`;

    const params = new URLSearchParams({
      channel: configValue.channelId,
      ts: configValue.threadTs,
    });

    const result = await this.app.http.loggedRequest({
      method: 'GET',
      url,
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Bearer ${connection.accessToken}`,
      },
      params,
      workspaceId,
    });

    if (result?.data?.ok) {
      return result.data;
    } else {
      throw new Error(`Failed to fetch thread messages: ${result.data?.error}`);
    }
  }

  async mockRun(): Promise<ResponseType> {
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
  }
}

type ResponseType = {
  ok: boolean;
  messages: Array<{
    type: string;
    user: string;
    text: string;
    ts: string;
    thread_ts: string;
    reply_count: number;
    replies: Array<{
      user: string;
      ts: string;
    }>;
    subscribed: boolean;
    last_read: string;
    unread_count: number;
  }>;
  has_more: boolean;
};

type ConfigValue = z.infer<GetThreadMessages['aiSchema']>;

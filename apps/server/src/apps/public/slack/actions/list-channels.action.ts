import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Slack } from '../slack.app';

export class ListChannels extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Slack;
  id() {
    return 'slack_action_list-channels';
  }
  name() {
    return 'List Channels';
  }
  description() {
    return 'Lists all channels in a Slack workspace';
  }
  aiSchema() {
    return z.object({});
  }
  inputConfig(): InputConfig[] {
    return [];
  }

  async run({
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<ResponseType> {
    const channels: Channel[] = [];

    let cursor;
    do {
      const url = 'https://slack.com/api/conversations.list';
      const data = new URLSearchParams({
        limit: '200',
        cursor: cursor ?? '',
      }) as any;

      const response = await this.app.http.loggedRequest({
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
        throw new Error('Failed to fetch channels');
      }

      channels.push(
        ...response.data.channels
          .filter((channel: any) => !channel.is_archived)
          .map((channel: any) => ({
            id: channel.id,
            name: channel.name,
            is_private: channel.is_private,
            is_member: channel.is_member,
          })),
      );

      cursor = response.data.response_metadata.next_cursor;
    } while (cursor !== '' && channels.length < 600);

    return { channels };
  }

  async mockRun(): Promise<ResponseType> {
    return {
      channels: [
        {
          id: 'channel-id-1',
          name: 'general',
          is_private: false,
          is_member: true,
        },
        {
          id: 'channel-id-2',
          name: 'random',
          is_private: false,
          is_member: true,
        },
      ],
    };
  }
}

type Channel = {
  id: string;
  name: string;
  is_private: boolean;
  is_member: boolean;
};

type ResponseType = {
  channels: Channel[];
};

type ConfigValue = z.infer<ReturnType<ListChannels['aiSchema']>>;

import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Slack } from '../slack.app';

export class CreateChannel extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Slack;
  id() {
    return 'slack_action_create-channel';
  }
  name() {
    return 'Create Channel';
  }
  description() {
    return 'Creates a new channel.';
  }
  aiSchema() {
    return z.object({
      name: z
        .string()
        .min(1)
        .regex(/^[a-z0-9-]+$/)
        .describe(
          'The name of the new channel. Cannot contain capital letters, spaces, or punctuation. Use dashes to separate words.',
        ),
      private: z
        .enum(['true', 'false'])
        .describe('True if the channel should be private, false otherwise'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        id: 'name',
        label: 'Channel Name',
        description:
          'Channel names can’t contain capital letters, spaces, or punctuation. Use dashes to separate words.',
        inputType: 'text',
        placeholder: 'Add a name',
        required: {
          missingMessage: 'Name is required',
          missingStatus: 'warning',
        },
      },
      {
        id: 'private',
        label: 'Private?',
        description: 'Should the channel be private?',
        inputType: 'switch',
        switchOptions: {
          checked: 'true',
          unchecked: 'false',
          defaultChecked: false,
        },
      },
    ];
  }

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<ResponseType> {
    const url = 'https://slack.com/api/conversations.create';
    const data = new URLSearchParams({
      name: configValue.name,
      is_private: configValue.private,
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
      throw new Error(`Failed to create channel: ${result.data?.error}`);
    }
  }

  async mockRun(): Promise<ResponseType> {
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
  }
}

type ResponseType = {
  ok: boolean;
  channel: {
    id: string;
    name: string;
    is_channel: boolean;
    is_group: boolean;
    is_im: boolean;
    created: number;
    is_archived: boolean;
    is_general: boolean;
    unlinked: number;
    name_normalized: string;
    is_shared: boolean;
    is_ext_shared: boolean;
    is_org_shared: boolean;
    pending_shared: unknown[];
    is_pending_ext_shared: boolean;
    is_member: boolean;
    is_private: boolean;
    is_mpim: boolean;
    last_read: string;
    latest: unknown;
    unread_count: number;
    unread_count_display: number;
    members: unknown[];
    topic: {
      value: string;
      creator: string;
      last_set: number;
    };
    shared_team_ids: string[];
    purpose: {
      value: string;
      creator: string;
      last_set: number;
    };
    priority: number;
  };
};

type ConfigValue = z.infer<ReturnType<CreateChannel['aiSchema']>>;

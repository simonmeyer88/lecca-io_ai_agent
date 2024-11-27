import { InputConfig } from '@/apps/lib/input-config';
import {
  RunTriggerArgs,
  TriggerConstructorArgs,
  WebhookAppTrigger,
} from '@/apps/lib/trigger';

import { Slack } from '../slack.app';
import { SlackWebhookBody } from '../types/slack.types';

export class NewMessage extends WebhookAppTrigger {
  constructor(args: TriggerConstructorArgs) {
    super(args);
  }

  app: Slack;
  id = 'slack_trigger_new-message';
  name = 'New Message';
  eventType = 'message';
  description = 'Triggered when a new message is sent in a channel.';
  inputConfig: InputConfig[] = [
    {
      ...this.app.dynamicSelectUser(),
      description: 'Filter by user that sent the message.',
      selectOptions: [
        {
          label: 'Anyone',
          value: 'any',
        },
      ],
      defaultValue: 'any',
      label: 'Filter by User',
    },
    {
      ...this.app.dynamicSelectChannel(),
      description: 'Filter by channel where the message was sent.',
      selectOptions: [
        {
          label: 'Any Channel',
          value: 'any',
        },
      ],
      defaultValue: 'any',
      label: 'Filter by Channel',
    },
  ];

  webhookPayloadMatchesIdentifier({
    webhookBody,
    connectionMetadata,
  }: {
    webhookBody: SlackWebhookBody;
    connectionMetadata: { team?: { id: string } };
  }): boolean {
    if (webhookBody.team_id !== connectionMetadata.team?.id) {
      return false;
    } else {
      return true;
    }
  }

  async run({
    inputData,
    configValue,
  }: RunTriggerArgs<ConfigValue, typeof mock>) {
    if (
      configValue.userId !== 'any' &&
      inputData?.body?.event?.user !== configValue.userId
    ) {
      return [];
    }

    if (
      configValue.channelId !== 'any' &&
      inputData?.body?.event?.channel !== configValue.channelId
    ) {
      return [];
    }

    return [inputData];
  }

  async mockRun() {
    return [mock];
  }
}

const mock = {
  body: {
    team_id: 'team-id',
    context_team_id: 'context-team-id',
    context_enterprise_id: 'context-enterprise-id',
    api_app_id: 'api-app-id',
    event: {
      user: 'user-id',
      type: 'message',
      ts: '0000000000.000000',
      client_msg_id: 'client-msg-id',
      text: 'Message Text',
      team: 'team-id',
      blocks: [] as any,
      channel: 'channel-id',
      event_ts: '0000000000.000000',
      channel_type: 'channel',
    },
    type: 'event_callback',
    event_id: 'event-id',
    event_time: 1718777323,
    authorizations: [
      {
        enterprise_id: 'enterprise-id',
        team_id: 'team-id',
        user_id: 'user-id',
        is_bot: false,
        is_enterprise_install: false,
      },
    ],
    is_ext_shared_channel: false,
    event_context: 'event-context',
  },
};

type ConfigValue = {
  userId: string;
  channelId: string;
};

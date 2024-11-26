import * as crypto from 'crypto';

import { Action } from '@/apps/lib/action';
import { Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { Trigger } from '@/apps/lib/trigger';
import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { ServerConfig } from '@/config/server.config';

import { CreateChannel } from './actions/create-channel.action';
import { GetThreadMessages } from './actions/get-thread-messages.action';
import { ListChannels } from './actions/list-channels.action';
import { ListUsers } from './actions/list-users.action';
import { ReplyToMessage } from './actions/reply-to-message.action';
import { SendMessageToChannel } from './actions/send-message-to-channel.action';
import { SendMessageToUser } from './actions/send-message-to-user.action';
import { SlackOAuth2 } from './connections/slack.oauth2';
import { NewMessage } from './triggers/new-message.trigger';

export class Slack extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

  id = 'slack';
  name = 'Slack';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description =
    'Slack is a messaging app for business that connects people to the information they need.';
  isPublished = true;

  connections(): Connection[] {
    return [new SlackOAuth2({ app: this })];
  }

  actions(): Action[] {
    return [
      new SendMessageToUser({ app: this }),
      new SendMessageToChannel({ app: this }),
      new ReplyToMessage({ app: this }),
      new GetThreadMessages({ app: this }),
      new CreateChannel({ app: this }),
      new ListChannels({ app: this }),
      new ListUsers({ app: this }),
    ];
  }

  triggers(): Trigger[] {
    return [new NewMessage({ app: this })];
  }

  verifyWebhookRequest({
    webhookBody,
    webhookHeaders,
  }: {
    webhookBody: unknown;
    webhookHeaders: Record<string, string>;
  }) {
    if (!ServerConfig.INTEGRATIONS.SLACK_SIGNING_SECRET) {
      throw new Error('Slack signing secret is not set');
    }

    // Construct the signature base string
    const timestamp = webhookHeaders['x-slack-request-timestamp'];
    const signature = webhookHeaders['x-slack-signature'];
    const signatureBaseString = `v0:${timestamp}:${webhookBody}`;
    const hmac = crypto.createHmac(
      'sha256',
      ServerConfig.INTEGRATIONS.SLACK_SIGNING_SECRET,
    );
    hmac.update(signatureBaseString);
    const computedSignature = `v0=${hmac.digest('hex')}`;
    return signature === computedSignature;
  }

  parseWebhookEventType({ webhookBody }: { webhookBody: any }) {
    return {
      event: webhookBody?.event?.type ?? '',
    };
  }

  dynamicSelectUser(): InputConfig {
    return {
      id: 'userId',
      label: 'User',
      description: 'Select a user',
      inputType: 'dynamic-select',
      _getDynamicValues: async ({ connection, workspaceId }) => {
        const users: { label: string; value: string }[] = [];

        let cursor;
        do {
          const url = 'https://slack.com/api/users.list';
          const data = new URLSearchParams({
            limit: '200',
            cursor: cursor ?? '',
          });

          const response = await this.http.loggedRequest({
            method: 'POST',
            url,
            data,
            headers: {
              Authorization: `Bearer ${connection.accessToken}`,
            },
            workspaceId,
          });

          if (response.data.ok !== true) {
            throw new Error('Failed to fetch users');
          }

          users.push(
            ...response.data.members
              .filter((member: any) => !member.deleted)
              .map((member: any) => ({
                label: member.real_name,
                value: member.id,
              })),
          );

          cursor = response.data.response_metadata.next_cursor;
        } while (cursor !== '' && users.length < 600);

        return users;
      },
      required: {
        missingMessage: 'Please select a user',
        missingStatus: 'warning',
      },
    };
  }

  dynamicSelectChannel(): InputConfig {
    return {
      id: 'channelId',
      label: 'Channel',
      description: '',
      inputType: 'dynamic-select',
      _getDynamicValues: async ({ connection, workspaceId }) => {
        const channels: { label: string; value: string }[] = [];

        let cursor;
        do {
          const url = 'https://slack.com/api/conversations.list';
          const data = new URLSearchParams({
            limit: '200',
            cursor: cursor ?? '',
            types: 'public_channel,private_channel', // Include both public and private channels
          });

          const response = await this.http.loggedRequest({
            method: 'POST',
            url,
            data,
            headers: {
              Authorization: `Bearer ${connection.accessToken}`,
            },
            workspaceId,
          });

          if (response.data.ok !== true) {
            throw new Error('Failed to fetch channels');
          }

          channels.push(
            ...response.data.channels
              .filter((channel: any) => !channel.is_archived)
              .map((channel: any) => ({
                label: channel.name,
                value: channel.id,
              })),
          );

          cursor = response.data.response_metadata.next_cursor;
        } while (cursor !== '' && channels.length < 600);

        return channels;
      },
      required: {
        missingMessage: 'Please select a channel',
        missingStatus: 'warning',
      },
    };
  }
}

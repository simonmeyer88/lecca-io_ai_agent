import {
  ConnectionConstructorArgs,
  ConnectionType,
  OAuth2Connection,
} from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { Slack } from '../slack.app';

export class SlackOAuth2 extends OAuth2Connection {
  constructor(args: ConnectionConstructorArgs) {
    super(args);
  }

  app: Slack;
  id() {
    return 'slack-connection-oauth2';
  }
  name() {
    return 'OAuth2';
  }
  description() {
    return 'Connect using OAuth2';
  }
  inputConfig(): InputConfig[] {
    return [];
  }
  connectionType(): ConnectionType {
    return 'oauth2';
  }
  authorizeUrl(): string {
    return 'https://slack.com/oauth/v2/authorize';
  }
  tokenUrl(): string {
    return 'https://slack.com/api/oauth.v2.access';
  }
  clientId(): string {
    return ServerConfig.INTEGRATIONS.SLACK_CLIENT_ID;
  }
  clientSecret(): string {
    return ServerConfig.INTEGRATIONS.SLACK_CLIENT_SECRET;
  }
  scopes(): string[] {
    return [
      'users:read.email',
      'reactions:write',
      'chat:write',
      'groups:read',
      'groups:write',
      'mpim:read',
      'mpim:write',
      'im:write',
      'users:read',
      'files:write',
      'files:read',
      'channels:read',
      'channels:manage',
      'channels:history',
      'reactions:read',
    ];
  }
  extraAuthParams(): Record<string, string> | null {
    return {
      user_scope: ['search:read', 'users.profile:write'].join(','),
    };
  }
}

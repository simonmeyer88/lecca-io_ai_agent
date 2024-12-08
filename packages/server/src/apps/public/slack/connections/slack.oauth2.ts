import { OAuth2Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { Slack } from '../slack.app';

export class SlackOAuth2 extends OAuth2Connection {
  app: Slack;
  id = 'slack_connection_oauth2';
  name = 'OAuth2';
  description = 'Connect using OAuth2';
  inputConfig: InputConfig[] = [];
  authorizeUrl = 'https://slack.com/oauth/v2/authorize';
  tokenUrl = 'https://slack.com/api/oauth.v2.access';
  clientId = ServerConfig.INTEGRATIONS.SLACK_CLIENT_ID;
  clientSecret = ServerConfig.INTEGRATIONS.SLACK_CLIENT_SECRET;
  scopes = [
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
  extraAuthParams = {
    user_scope: ['search:read', 'users.profile:write'].join(','),
  };
}

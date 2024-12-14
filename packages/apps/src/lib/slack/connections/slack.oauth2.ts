import { createOAuth2Connection } from '@lecca-io/toolkit';

export const slackOAuth2 = createOAuth2Connection({
  id: 'slack_connection_oauth2',
  name: 'OAuth2',
  description: 'Connect using OAuth2',
  authorizeUrl: 'https://slack.com/oauth/v2/authorize',
  tokenUrl: 'https://slack.com/api/oauth.v2.access',
  getClientId: () => process.env.INTEGRATION_SLACK_CLIENT_ID,
  getClientSecret: () => process.env.INTEGRATION_SLACK_CLIENT_SECRET,
  scopes: [
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
  ],
  extraAuthParams: {
    user_scope: ['search:read', 'users.profile:write'].join(','),
  },
});

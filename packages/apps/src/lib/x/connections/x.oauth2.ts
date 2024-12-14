import { createOAuth2Connection } from '@lecca-io/toolkit';

export const xOAuth2 = createOAuth2Connection({
  id: 'x_connection_oauth2',
  name: 'OAuth2',
  description: 'Connect using OAuth2',
  inputConfig: [],
  authorizeUrl: 'https://twitter.com/i/oauth2/authorize',
  tokenUrl: 'https://api.x.com/2/oauth2/token',
  getClientId: () => process.env.INTEGRATION_X_CLIENT_ID,
  getClientSecret: () => process.env.INTEGRATION_X_CLIENT_SECRET,
  scopes: [
    'tweet.read',
    'tweet.write',
    'users.read',
    'follows.read',
    'follows.write',
    'offline.access',
    'like.write',
    'like.read',
  ],
  scopeDelimiter: ' ',
  authorizationMethod: 'header',
  pkce: true,
});

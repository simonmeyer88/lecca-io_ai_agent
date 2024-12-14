import { createOAuth2Connection } from '@lecca-io/toolkit';

export const calendlyOAuth2 = createOAuth2Connection({
  id: 'calendly_connection_oauth2',
  name: 'OAuth2',
  description: 'Connect to Calendly using OAuth2',
  authorizeUrl: 'https://auth.calendly.com/oauth/authorize',
  tokenUrl: 'https://auth.calendly.com/oauth/token',
  getClientId: () => process.env.INTEGRATION_CALENDLY_CLIENT_ID,
  getClientSecret: () => process.env.INTEGRATION_CALENDLY_CLIENT_SECRET,
  scopes: ['default'],
  scopeDelimiter: ' ',
});

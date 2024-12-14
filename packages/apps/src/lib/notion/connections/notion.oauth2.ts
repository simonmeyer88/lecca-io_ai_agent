import { createOAuth2Connection } from '@lecca-io/toolkit';

export const notionOAuth2 = createOAuth2Connection({
  id: 'notion_connection_oauth2',
  name: 'OAuth2',
  description: 'Connect using OAuth2',
  inputConfig: [],
  authorizeUrl: 'https://api.notion.com/v1/oauth/authorize',
  tokenUrl: 'https://api.notion.com/v1/oauth/token',
  getClientId: () => process.env.INTEGRATION_NOTION_CLIENT_ID,
  getClientSecret: () => process.env.INTEGRATION_NOTION_CLIENT_SECRET,
  scopes: [],
  extraAuthParams: {
    owner: 'user',
  },
  authorizationMethod: 'header',
  redirectToLocalHostInDevelopment: true,
});

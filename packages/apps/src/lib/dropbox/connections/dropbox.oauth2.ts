import { createOAuth2Connection } from '@lecca-io/toolkit';

export const dropboxOAuth2 = createOAuth2Connection({
  id: 'dropbox_connection_oauth2',
  name: 'OAuth2',
  description: 'Connect to Dropbox using OAuth2.',
  authorizeUrl: 'https://www.dropbox.com/oauth2/authorize',
  tokenUrl: 'https://api.dropboxapi.com/oauth2/token',
  getClientId: () => process.env.INTEGRATION_DROPBOX_CLIENT_ID,
  getClientSecret: () => process.env.INTEGRATION_DROPBOX_CLIENT_SECRET,
  scopes: [
    'files.metadata.write',
    'files.metadata.read',
    'files.content.write',
    'files.content.read',
    'sharing.write',
    'sharing.read',
  ],
  extraAuthParams: {
    token_access_type: 'offline',
  },
  scopeDelimiter: ' ',
});

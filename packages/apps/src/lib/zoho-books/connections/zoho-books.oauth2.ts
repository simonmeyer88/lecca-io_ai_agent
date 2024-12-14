import { createOAuth2Connection } from '@lecca-io/toolkit';

export const zohoBooksOAuth2US = createOAuth2Connection({
  id: 'zoho-books_connection_oauth2-US',
  name: 'zoho.com',
  description: 'Connect to Zoho Books on the US data center (zoho.com)',
  inputConfig: [],
  authorizeUrl: `https://accounts.zoho.com/oauth/v2/auth`,
  tokenUrl: `https://accounts.zoho.com/oauth/v2/token`,
  getClientId: () => process.env.INTEGRATION_ZOHO_BOOKS_CLIENT_ID,
  getClientSecret: () => process.env.INTEGRATION_ZOHO_BOOKS_CLIENT_SECRET,
  scopes: ['ZohoBooks.fullaccess.ALL'],
  extraAuthParams: {
    prompt: 'consent',
    access_type: 'offline',
  },
});

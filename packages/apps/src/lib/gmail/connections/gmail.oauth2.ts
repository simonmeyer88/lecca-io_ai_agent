import { createOAuth2Connection } from '@lecca-io/toolkit';

export const gmailOAuth2 = createOAuth2Connection({
  id: 'gmail_connection_oauth2',
  name: 'OAuth2',
  description: 'Connect using OAuth2',
  authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  clientId: process.env.INTEGRATION_GMAIL_CLIENT_ID,
  clientSecret: process.env.INTEGRATION_GMAIL_CLIENT_SECRET,
  scopes: [
    'https://www.googleapis.com/auth/gmail.readonly',
    'https://www.googleapis.com/auth/gmail.modify',
    'https://www.googleapis.com/auth/gmail.compose',
    'https://www.googleapis.com/auth/gmail.send',
  ],
  scopeDelimiter: ' ',
  extraAuthParams: {
    access_type: 'offline',
    prompt: 'consent',
  },
});

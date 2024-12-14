import { createOAuth2Connection } from '@lecca-io/toolkit';

export const youtubeOAuth2 = createOAuth2Connection({
  id: 'youtube_connection_oauth2',
  name: 'OAuth2',
  description: 'Connect using OAuth2',
  authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  getClientId: () => process.env.INTEGRATION_YOUTUBE_CLIENT_ID,
  getClientSecret: () => process.env.INTEGRATION_YOUTUBE_CLIENT_SECRET,
  scopes: [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly',
  ],
  scopeDelimiter: ' ',
  extraAuthParams: {
    access_type: 'offline',
    prompt: 'consent',
  },
});

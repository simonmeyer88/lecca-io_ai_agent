import { createOAuth2Connection } from '@lecca-io/toolkit';

export const googleCalendarOAuth2 = createOAuth2Connection({
  id: 'google-calendar_connection_oauth2',
  name: 'OAuth2',
  description: 'Connect using OAuth2',
  authorizeUrl: 'https://accounts.google.com/o/oauth2/v2/auth',
  tokenUrl: 'https://oauth2.googleapis.com/token',
  getClientId: () => process.env.INTEGRATION_GOOGLE_CALENDAR_CLIENT_ID,
  getClientSecret: () => process.env.INTEGRATION_GOOGLE_CALENDAR_CLIENT_SECRET,
  scopes: [
    'https://www.googleapis.com/auth/calendar.events',
    'https://www.googleapis.com/auth/calendar.readonly',
  ],
  scopeDelimiter: ' ',
  extraAuthParams: {
    access_type: 'offline',
    prompt: 'consent',
  },
});

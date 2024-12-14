import { createOAuth2Connection } from '@lecca-io/toolkit';

export const microsoftOutlookOAuth2 = createOAuth2Connection({
  id: 'microsoft-outlook_connection_oauth2',
  name: 'OAuth2',
  description: 'Connect using OAuth2',
  inputConfig: [],
  authorizeUrl:
    'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  getClientId: () => process.env.INTEGRATION_MICROSOFT_OUTLOOK_CLIENT_ID,
  getClientSecret: () =>
    process.env.INTEGRATION_MICROSOFT_OUTLOOK_CLIENT_SECRET,
  scopes: [
    'Mail.Send',
    'Mail.ReadWrite',
    'Calendars.ReadWrite',
    'Contacts.ReadWrite',
    'offline_access',
    'User.Read',
  ],
  redirectToLocalHostInDevelopment: true,
});

import { createOAuth2Connection } from '@lecca-io/toolkit';

export const microsoftExcel365OAuth2 = createOAuth2Connection({
  id: 'microsoft-excel-365_connection_oauth2',
  name: 'OAuth2',
  description: 'Connect using OAuth2',
  authorizeUrl:
    'https://login.microsoftonline.com/common/oauth2/v2.0/authorize',
  tokenUrl: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
  getClientId: () => process.env.INTEGRATION_MICROSOFT_365_EXCEL_CLIENT_ID,
  getClientSecret: () =>
    process.env.INTEGRATION_MICROSOFT_365_EXCEL_CLIENT_SECRET,
  scopes: ['Files.ReadWrite', 'User.Read', 'offline_access'],
  redirectToLocalHostInDevelopment: true,
});

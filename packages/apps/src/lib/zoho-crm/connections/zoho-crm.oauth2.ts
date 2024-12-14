import { createOAuth2Connection } from '@lecca-io/toolkit';

export const zohoCrmOAuth2US = createOAuth2Connection({
  id: 'zoho-crm_connection_oauth2-US',
  name: 'zoho.com',
  description: 'Connect to Zoho on the US data center (zoho.com)',
  inputConfig: [],
  authorizeUrl: `https://accounts.zoho.com/oauth/v2/auth`,
  tokenUrl: `https://accounts.zoho.com/oauth/v2/token`,
  getClientId: () => process.env.INTEGRATION_ZOHO_CRM_CLIENT_ID,
  getClientSecret: () => process.env.INTEGRATION_ZOHO_CRM_CLIENT_SECRET,
  scopes: [
    'ZohoCRM.users.ALL',
    'ZohoCRM.org.ALL',
    'ZohoCRM.settings.ALL',
    'ZohoCRM.modules.ALL',
    'ZohoCRM.bulk.ALL',
    'ZohoCRM.bulk.backup.ALL',
    'ZohoFiles.files.ALL',
  ],
  extraAuthParams: {
    prompt: 'consent',
    access_type: 'offline',
  },
});

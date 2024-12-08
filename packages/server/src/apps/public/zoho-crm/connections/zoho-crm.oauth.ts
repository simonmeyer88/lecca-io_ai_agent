import { OAuth2Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { ZohoCrm } from '../zoho-crm.app';

export class ZohoCrmOAuth2US extends OAuth2Connection {
  app: ZohoCrm;
  location = 'com';
  id = 'zoho-crm_connection_oauth2-US';
  name = 'zoho.com';
  description = 'Connect to Zoho on the US data center (zoho.com)';
  inputConfig: InputConfig[] = [];
  authorizeUrl = `https://accounts.zoho.${this.location}/oauth/v2/auth`;
  tokenUrl = `https://accounts.zoho.${this.location}/oauth/v2/token`;
  clientId = ServerConfig.INTEGRATIONS.ZOHO_CRM_CLIENT_ID;
  clientSecret = ServerConfig.INTEGRATIONS.ZOHO_CRM_CLIENT_SECRET;
  scopes = [
    'ZohoCRM.users.ALL',
    'ZohoCRM.org.ALL',
    'ZohoCRM.settings.ALL',
    'ZohoCRM.modules.ALL',
    'ZohoCRM.bulk.ALL',
    'ZohoCRM.bulk.backup.ALL',
    'ZohoFiles.files.ALL',
  ];
  extraAuthParams = {
    prompt: 'consent',
    access_type: 'offline',
  };
}

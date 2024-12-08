import { OAuth2Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { MicrosoftExcel365 } from '../microsoft-excel-365.app';

export class MicrosoftExcel365OAuth2 extends OAuth2Connection {
  app: MicrosoftExcel365;
  id = 'microsoft-excel-365_connection_oauth2';
  name = 'OAuth2';
  description = 'Connect using OAuth2';
  inputConfig: InputConfig[] = [];
  authorizeUrl =
    'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
  tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  clientId = ServerConfig.INTEGRATIONS.MICROSOFT_365_EXCEL_CLIENT_ID;
  clientSecret = ServerConfig.INTEGRATIONS.MICROSOFT_365_EXCEL_CLIENT_SECRET;
  scopes = ['Files.ReadWrite', 'User.Read', 'offline_access'];
  redirectToLocalHostInDevelopment = true;
}

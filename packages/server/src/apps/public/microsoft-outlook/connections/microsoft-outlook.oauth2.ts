import { OAuth2Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { MicrosoftOutlook } from '../microsoft-outlook.app';

export class MicrosoftOutlookOAuth2 extends OAuth2Connection {
  app: MicrosoftOutlook;
  id = 'microsoft-outlook_connection_oauth2';
  name = 'OAuth2';
  description = 'Connect using OAuth2';
  inputConfig: InputConfig[] = [];
  authorizeUrl =
    'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
  tokenUrl = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  clientId = ServerConfig.INTEGRATIONS.MICROSOFT_OUTLOOK_CLIENT_ID;
  clientSecret = ServerConfig.INTEGRATIONS.MICROSOFT_OUTLOOK_CLIENT_SECRET;
  scopes = [
    'Mail.Send',
    'Mail.ReadWrite',
    'Calendars.ReadWrite',
    'Contacts.ReadWrite',
    'offline_access',
    'User.Read',
  ];
  redirectToLocalHostInDevelopment = true;
}

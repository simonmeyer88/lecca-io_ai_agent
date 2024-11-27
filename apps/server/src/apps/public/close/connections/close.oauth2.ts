import { OAuth2Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { Close } from '../close.app';

export class CloseOAuth2 extends OAuth2Connection {
  app: Close;
  id = 'close_connection_oauth2';
  name = 'OAuth2';
  description = 'Connect using OAuth2';
  inputConfig: InputConfig[] = [];
  authorizeUrl = 'https://app.close.com/oauth2/authorize';
  tokenUrl = 'https://api.close.com/oauth2/token';
  clientId = ServerConfig.INTEGRATIONS.CLOSE_CLIENT_ID;
  clientSecret = ServerConfig.INTEGRATIONS.CLOSE_CLIENT_SECRET;
  scopes = [];
  extraAuthHeaders = {
    Host: 'api.close.com',
  };
}

import { OAuth2Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { Calendly } from '../calendly.app';

export class CalendlyOAuth2 extends OAuth2Connection {
  app: Calendly;
  id = 'calendly_connection_oauth2';
  name = 'OAuth2';
  description = 'Connect to Calendly using OAuth2';
  inputConfig: InputConfig[] = [];
  authorizeUrl = 'https://auth.calendly.com/oauth/authorize';
  tokenUrl = 'https://auth.calendly.com/oauth/token';
  clientId = ServerConfig.INTEGRATIONS.CALENDLY_CLIENT_ID;
  clientSecret = ServerConfig.INTEGRATIONS.CALENDLY_CLIENT_SECRET;
  scopes = ['default'];
  scopeDelimiter = ' ';
}

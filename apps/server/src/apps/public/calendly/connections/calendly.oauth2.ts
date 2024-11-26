import {
  ConnectionConstructorArgs,
  OAuth2Connection,
} from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { Calendly } from '../calendly.app';

export class CalendlyOAuth2 extends OAuth2Connection {
  constructor(args: ConnectionConstructorArgs) {
    super(args);
  }

  app: Calendly;

  id() {
    return 'calendly-connection-oauth2';
  }
  name() {
    return 'OAuth2';
  }
  description() {
    return 'Connect to Calendly using OAuth2';
  }
  inputConfig(): InputConfig[] {
    return [];
  }
  authorizeUrl(): string {
    return 'https://auth.calendly.com/oauth/authorize';
  }
  tokenUrl(): string {
    return 'https://auth.calendly.com/oauth/token';
  }
  clientId(): string {
    return ServerConfig.INTEGRATIONS.CALENDLY_CLIENT_ID;
  }
  clientSecret(): string {
    return ServerConfig.INTEGRATIONS.CALENDLY_CLIENT_SECRET;
  }
  scopes(): string[] {
    return ['default'];
  }
  scopeDelimiter(): string {
    return ' ';
  }
}

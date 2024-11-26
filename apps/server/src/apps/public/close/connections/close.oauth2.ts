import {
  ConnectionConstructorArgs,
  ConnectionType,
  OAuth2Connection,
} from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { Close } from '../close.app';

export class CloseOAuth2 extends OAuth2Connection {
  constructor(args: ConnectionConstructorArgs) {
    super(args);
  }

  app: Close;
  id() {
    return 'close-connection-oauth2';
  }
  name() {
    return 'OAuth2';
  }
  description() {
    return 'Connect using OAuth2';
  }
  inputConfig(): InputConfig[] {
    return [];
  }
  connectionType(): ConnectionType {
    return 'oauth2';
  }
  authorizeUrl(): string {
    return 'https://app.close.com/oauth2/authorize';
  }
  tokenUrl(): string {
    return 'https://api.close.com/oauth2/token';
  }
  clientId(): string {
    return ServerConfig.INTEGRATIONS.CLOSE_CLIENT_ID;
  }
  clientSecret(): string {
    return ServerConfig.INTEGRATIONS.CLOSE_CLIENT_SECRET;
  }
  scopes(): string[] {
    return [];
  }
  extraAuthHeaders(): Record<string, string> | null {
    return {
      Host: 'api.close.com',
    };
  }
}

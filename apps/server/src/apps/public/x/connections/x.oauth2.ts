import {
  ConnectionConstructorArgs,
  ConnectionType,
  OAuth2AuthorizationMethod,
  OAuth2Connection,
} from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { X } from '../x.app';

export class XOAuth2 extends OAuth2Connection {
  constructor(args: ConnectionConstructorArgs) {
    super(args);
  }

  app: X;

  id() {
    return 'x-connection-oauth2';
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
    return 'https://twitter.com/i/oauth2/authorize';
  }
  tokenUrl(): string {
    return 'https://api.x.com/2/oauth2/token';
  }
  clientId(): string {
    return ServerConfig.INTEGRATIONS.X_CLIENT_ID;
  }
  clientSecret(): string {
    return ServerConfig.INTEGRATIONS.X_CLIENT_SECRET;
  }
  scopes(): string[] {
    return [
      'tweet.read',
      'tweet.write',
      'users.read',
      'follows.read',
      'follows.write',
      'offline.access',
      'like.write',
      'like.read',
    ];
  }
  scopeDelimiter(): string {
    return ' ';
  }
  authorizationMethod(): OAuth2AuthorizationMethod {
    return 'header';
  }
  pkce(): boolean {
    return true;
  }
}

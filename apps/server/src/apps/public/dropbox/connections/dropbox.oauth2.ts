import {
  ConnectionConstructorArgs,
  OAuth2Connection,
} from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { Dropbox } from '../dropbox.app';
import { ServerConfig } from '@/config/server.config';

export class DropboxOAuth2 extends OAuth2Connection {
  constructor(args: ConnectionConstructorArgs) {
    super(args);
  }

  app: Dropbox;

  id() {
    return 'dropbox-connection-oauth2';
  }
  name() {
    return 'OAuth2';
  }
  description() {
    return 'Connect to Dropbox using OAuth2';
  }
  inputConfig(): InputConfig[] {
    return [];
  }
  authorizeUrl(): string {
    return 'https://www.dropbox.com/oauth2/authorize';
  }
  tokenUrl(): string {
    return 'https://api.dropboxapi.com/oauth2/token';
  }
  clientId(): string {
    return ServerConfig.INTEGRATIONS.DROPBOX_CLIENT_ID;
  }
  clientSecret(): string {
    return ServerConfig.INTEGRATIONS.DROPBOX_CLIENT_SECRET;
  }
  extraAuthParams(): Record<string, string> | null {
    return {
      token_access_type: 'offline',
    };
  }
  scopes(): string[] {
    return [
      'files.metadata.write',
      'files.metadata.read',
      'files.content.write',
      'files.content.read',
      'sharing.write',
      'sharing.read',
    ];
  }
  scopeDelimiter(): string {
    return ' ';
  }
}

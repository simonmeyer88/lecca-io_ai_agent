import {
  ConnectionConstructorArgs,
  ConnectionType,
  OAuth2Connection,
} from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { Gmail } from '../gmail.app';

export class GmailOAuth2 extends OAuth2Connection {
  constructor(args: ConnectionConstructorArgs) {
    super(args);
  }

  app: Gmail;
  id() {
    return 'gmail-connection-oauth2';
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
    return 'https://accounts.google.com/o/oauth2/v2/auth';
  }
  tokenUrl(): string {
    return 'https://oauth2.googleapis.com/token';
  }
  clientId(): string {
    return ServerConfig.INTEGRATIONS.GMAIL_CLIENT_ID;
  }
  clientSecret(): string {
    return ServerConfig.INTEGRATIONS.GMAIL_CLIENT_SECRET;
  }
  scopes(): string[] {
    return [
      'https://www.googleapis.com/auth/gmail.readonly',
      'https://www.googleapis.com/auth/gmail.modify',
      'https://www.googleapis.com/auth/gmail.compose',
      'https://www.googleapis.com/auth/gmail.send',
    ];
  }
  scopeDelimiter(): string {
    return ' ';
  }
  extraAuthParams(): Record<string, string> | null {
    return {
      access_type: 'offline',
      prompt: 'consent',
    };
  }
}

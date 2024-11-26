import {
  ConnectionConstructorArgs,
  ConnectionType,
  OAuth2Connection,
} from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { ZohoBooks } from '../zoho-books.app';

export class ZohoBooksOAuth2US extends OAuth2Connection {
  constructor(args: ConnectionConstructorArgs) {
    super(args);
  }

  app: ZohoBooks;
  location = 'com';
  id() {
    return 'zoho-books-connection-oauth2-US';
  }
  name() {
    return 'zoho.com';
  }
  description() {
    return 'Connect to Zoho Books on the US data center (zoho.com)';
  }
  inputConfig(): InputConfig[] {
    return [];
  }
  connectionType(): ConnectionType {
    return 'oauth2';
  }
  authorizeUrl(): string {
    return `https://accounts.zoho.${this.location}/oauth/v2/auth`;
  }
  tokenUrl(): string {
    return `https://accounts.zoho.${this.location}/oauth/v2/token`;
  }
  clientId(): string {
    return ServerConfig.INTEGRATIONS.ZOHO_BOOKS_CLIENT_ID;
  }
  clientSecret(): string {
    return ServerConfig.INTEGRATIONS.ZOHO_BOOKS_CLIENT_SECRET;
  }
  scopes(): string[] {
    return ['ZohoBooks.fullaccess.ALL'];
  }
  extraAuthParams(): Record<string, string> | null {
    return {
      prompt: 'consent',
      access_type: 'offline',
    };
  }
}

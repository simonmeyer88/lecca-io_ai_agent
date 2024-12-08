import { OAuth2Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { ZohoBooks } from '../zoho-books.app';

export class ZohoBooksOAuth2US extends OAuth2Connection {
  app: ZohoBooks;
  location = 'com';
  id = 'zoho-books_connection_oauth2-US';
  name = 'zoho.com';
  description = 'Connect to Zoho Books on the US data center (zoho.com)';
  inputConfig: InputConfig[] = [];
  authorizeUrl = `https://accounts.zoho.${this.location}/oauth/v2/auth`;
  tokenUrl = `https://accounts.zoho.${this.location}/oauth/v2/token`;
  clientId = ServerConfig.INTEGRATIONS.ZOHO_BOOKS_CLIENT_ID;
  clientSecret = ServerConfig.INTEGRATIONS.ZOHO_BOOKS_CLIENT_SECRET;
  scopes = ['ZohoBooks.fullaccess.ALL'];
  extraAuthParams = {
    prompt: 'consent',
    access_type: 'offline',
  };
}

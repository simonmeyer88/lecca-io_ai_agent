import { OAuth2Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { Dropbox } from '../dropbox.app';

export class DropboxOAuth2 extends OAuth2Connection {
  app: Dropbox;
  id = 'dropbox_connection_oauth2';
  name = 'OAuth2';
  description = 'Connect to Dropbox using OAuth2';
  inputConfig: InputConfig[] = [];
  authorizeUrl = 'https://www.dropbox.com/oauth2/authorize';
  tokenUrl = 'https://api.dropboxapi.com/oauth2/token';
  clientId = ServerConfig.INTEGRATIONS.DROPBOX_CLIENT_ID;
  clientSecret = ServerConfig.INTEGRATIONS.DROPBOX_CLIENT_SECRET;
  extraAuthParams = {
    token_access_type: 'offline',
  };
  scopes = [
    'files.metadata.write',
    'files.metadata.read',
    'files.content.write',
    'files.content.read',
    'sharing.write',
    'sharing.read',
  ];
  scopeDelimiter = ' ';
}

import {
  OAuth2AuthorizationMethod,
  OAuth2Connection,
} from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { X } from '../x.app';

export class XOAuth2 extends OAuth2Connection {
  app: X;
  id = 'x_connection_oauth2';
  name = 'OAuth2';
  description = 'Connect using OAuth2';
  inputConfig: InputConfig[] = [];
  authorizeUrl = 'https://twitter.com/i/oauth2/authorize';
  tokenUrl = 'https://api.x.com/2/oauth2/token';
  clientId = ServerConfig.INTEGRATIONS.X_CLIENT_ID;
  clientSecret = ServerConfig.INTEGRATIONS.X_CLIENT_SECRET;
  scopes = [
    'tweet.read',
    'tweet.write',
    'users.read',
    'follows.read',
    'follows.write',
    'offline.access',
    'like.write',
    'like.read',
  ];
  scopeDelimiter = ' ';
  authorizationMethod: OAuth2AuthorizationMethod = 'header';
  pkce = true;
}

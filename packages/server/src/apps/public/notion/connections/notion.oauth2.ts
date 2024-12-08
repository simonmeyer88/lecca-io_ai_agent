import {
  OAuth2AuthorizationMethod,
  OAuth2Connection,
} from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { Notion } from '../notion.app';

export class NotionOAuth2 extends OAuth2Connection {
  app: Notion;
  id = 'notion_connection_oauth2';
  name = 'OAuth2';
  description = 'Connect using OAuth2';
  inputConfig: InputConfig[] = [];
  authorizeUrl = 'https://api.notion.com/v1/oauth/authorize';
  tokenUrl = 'https://api.notion.com/v1/oauth/token';
  clientId = ServerConfig.INTEGRATIONS.NOTION_CLIENT_ID;
  clientSecret = ServerConfig.INTEGRATIONS.NOTION_CLIENT_SECRET;
  scopes = [];
  extraAuthParams = {
    owner: 'user',
  };
  authorizationMethod: OAuth2AuthorizationMethod = 'header';
  redirectToLocalHostInDevelopment = true;
}

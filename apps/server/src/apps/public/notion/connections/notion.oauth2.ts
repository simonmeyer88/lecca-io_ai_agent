import {
  ConnectionConstructorArgs,
  ConnectionType,
  OAuth2AuthorizationMethod,
  OAuth2Connection,
} from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { Notion } from '../notion.app';

export class NotionOAuth2 extends OAuth2Connection {
  constructor(args: ConnectionConstructorArgs) {
    super(args);
  }

  app: Notion;
  id() {
    return 'notion-connection-oauth2';
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
    return 'https://api.notion.com/v1/oauth/authorize';
  }
  tokenUrl(): string {
    return 'https://api.notion.com/v1/oauth/token';
  }
  clientId(): string {
    return ServerConfig.INTEGRATIONS.NOTION_CLIENT_ID;
  }
  clientSecret(): string {
    return ServerConfig.INTEGRATIONS.NOTION_CLIENT_SECRET;
  }
  scopes(): string[] {
    return [];
  }
  extraAuthParams(): Record<string, string> | null {
    return {
      owner: 'user',
    };
  }
  authorizationMethod(): OAuth2AuthorizationMethod {
    return 'header';
  }
  redirectToLocalHostInDevelopment(): boolean {
    //You can delete this override in a few weeks once we've changed the uris.
    //We're currently in review for notion and can't change anything.
    return true;
  }
}

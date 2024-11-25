import {
  ConnectionConstructorArgs,
  ConnectionType,
  OAuth2Connection,
} from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { FacebookPages } from '../facebook-pages.app';
import { ServerConfig } from '@/config/server.config';

export class FacebookOAuth2 extends OAuth2Connection {
  constructor(args: ConnectionConstructorArgs) {
    super(args);
  }

  app: FacebookPages;

  id() {
    return 'facebook-pages-connection-oauth2';
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
    return 'https://graph.facebook.com/oauth/authorize';
  }
  tokenUrl(): string {
    return 'https://graph.facebook.com/oauth/access_token';
  }
  clientId(): string {
    return ServerConfig.INTEGRATIONS.FACEBOOK_PAGES_CLIENT_ID;
  }
  clientSecret(): string {
    return ServerConfig.INTEGRATIONS.FACEBOOK_PAGES_CLIENT_SECRET;
  }
  scopes(): string[] {
    return [
      'pages_show_list',
      'pages_manage_posts',
      'business_management',
      'pages_read_engagement',
    ];
  }
}

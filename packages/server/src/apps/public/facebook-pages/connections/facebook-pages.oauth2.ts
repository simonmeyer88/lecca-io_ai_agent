import { OAuth2Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { FacebookPages } from '../facebook-pages.app';

export class FacebookOAuth2 extends OAuth2Connection {
  app: FacebookPages;
  id = 'facebook-pages_connection_oauth2';
  name = 'OAuth2';
  description = 'Connect using OAuth2';
  inputConfig: InputConfig[] = [];
  authorizeUrl = 'https://graph.facebook.com/oauth/authorize';
  tokenUrl = 'https://graph.facebook.com/oauth/access_token';
  clientId = ServerConfig.INTEGRATIONS.FACEBOOK_PAGES_CLIENT_ID;
  clientSecret = ServerConfig.INTEGRATIONS.FACEBOOK_PAGES_CLIENT_SECRET;
  scopes = [
    'pages_show_list',
    'pages_manage_posts',
    'business_management',
    'pages_read_engagement',
  ];
}

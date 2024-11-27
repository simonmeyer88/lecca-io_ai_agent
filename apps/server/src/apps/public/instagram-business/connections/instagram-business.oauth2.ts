import { OAuth2Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { InstagramBusiness } from '../instagram-business.app';

export class InstagramBusinessOAuth2 extends OAuth2Connection {
  app: InstagramBusiness;
  id = 'instagram-business_connection_oauth2';
  name = 'OAuth2';
  description = 'Connect using OAuth2';
  inputConfig: InputConfig[] = [];
  authorizeUrl = 'https://www.instagram.com/oauth/authorize';
  tokenUrl = 'https://graph.facebook.com/oauth/access_token';
  clientId = ServerConfig.INTEGRATIONS.INSTAGRAM_BUSINESS_CLIENT_ID;
  clientSecret = ServerConfig.INTEGRATIONS.INSTAGRAM_BUSINESS_CLIENT_SECRET;
  scopes = [
    'instagram_business_basic',
    'instagram_business_content_publish',
    'instagram_business_manage_messages',
    'instagram_business_manage_comments',
  ];
  extraAuthParams = {
    enable_fb_login: '0',
  };
}

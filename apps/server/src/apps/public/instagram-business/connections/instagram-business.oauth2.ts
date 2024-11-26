import {
  ConnectionConstructorArgs,
  ConnectionType,
  OAuth2Connection,
} from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { InstagramBusiness } from '../instagram-business.app';

export class InstagramBusinessOAuth2 extends OAuth2Connection {
  constructor(args: ConnectionConstructorArgs) {
    super(args);
  }

  app: InstagramBusiness;
  id() {
    return 'instagram-business-connection-oauth2';
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
    return 'https://www.instagram.com/oauth/authorize';
  }
  tokenUrl(): string {
    return 'https://graph.facebook.com/oauth/access_token';
  }
  clientId(): string {
    return ServerConfig.INTEGRATIONS.INSTAGRAM_BUSINESS_CLIENT_ID;
  }
  clientSecret(): string {
    return ServerConfig.INTEGRATIONS.INSTAGRAM_BUSINESS_CLIENT_SECRET;
  }
  scopes(): string[] {
    return [
      'instagram_business_basic',
      'instagram_business_content_publish',
      'instagram_business_manage_messages',
      'instagram_business_manage_comments',
    ];
  }
  extraAuthParams(): Record<string, string> | null {
    return {
      enable_fb_login: '0',
    };
  }
}

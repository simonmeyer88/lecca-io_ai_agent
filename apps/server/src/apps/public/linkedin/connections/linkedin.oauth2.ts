import {
  ConnectionConstructorArgs,
  ConnectionType,
  OAuth2Connection,
} from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { Linkedin } from '../linkedin.app';

export class LinkedinOAuth2 extends OAuth2Connection {
  constructor(args: ConnectionConstructorArgs) {
    super(args);
  }

  app: Linkedin;
  id() {
    return 'linkedin-connection-oauth2';
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
    return 'https://www.linkedin.com/oauth/v2/authorization';
  }
  tokenUrl(): string {
    return 'https://www.linkedin.com/oauth/v2/accessToken';
  }
  clientId(): string {
    return ServerConfig.INTEGRATIONS.LINKEDIN_CLIENT_ID;
  }
  clientSecret(): string {
    return ServerConfig.INTEGRATIONS.LINKEDIN_CLIENT_SECRET;
  }
  scopes(): string[] {
    return [
      'r_basicprofile',
      'w_member_social',
      'w_organization_social',
      'rw_organization_admin',
      'openid',
      'email',
      'profile',
    ];
  }
}

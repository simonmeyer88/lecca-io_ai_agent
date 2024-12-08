import { OAuth2Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { Linkedin } from '../linkedin.app';

export class LinkedinOAuth2 extends OAuth2Connection {
  app: Linkedin;
  id = 'linkedin_connection_oauth2';
  name = 'OAuth2';
  description = 'Connect using OAuth2';
  inputConfig: InputConfig[] = [];
  authorizeUrl = 'https://www.linkedin.com/oauth/v2/authorization';
  tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
  clientId = ServerConfig.INTEGRATIONS.LINKEDIN_CLIENT_ID;
  clientSecret = ServerConfig.INTEGRATIONS.LINKEDIN_CLIENT_SECRET;
  scopes = [
    'r_basicprofile',
    'w_member_social',
    'w_organization_social',
    'rw_organization_admin',
    'openid',
    'email',
    'profile',
  ];
}

import { createOAuth2Connection } from '@lecca-io/toolkit';

export const linkedinOAuth2 = createOAuth2Connection({
  id: 'linkedin_connection_oauth2',
  name: 'OAuth2',
  description: 'Connect using OAuth2',
  authorizeUrl: 'https://www.linkedin.com/oauth/v2/authorization',
  tokenUrl: 'https://www.linkedin.com/oauth/v2/accessToken',
  clientId: process.env.INTEGRATION_LINKEDIN_CLIENT_ID,
  clientSecret: process.env.INTEGRATION_LINKEDIN_CLIENT_SECRET,
  scopes: [
    'r_basicprofile',
    'w_member_social',
    'w_organization_social',
    'rw_organization_admin',
    'openid',
    'email',
    'profile',
  ],
});

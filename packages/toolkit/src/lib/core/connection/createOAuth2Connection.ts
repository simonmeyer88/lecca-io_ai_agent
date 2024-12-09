import { InputConfig } from '../../types/input-config.types';

export function createOAuth2Connection(args: CreateOAuth2ConnectionArgs) {
  return {
    ...args,
    connectionType: 'oauth2',
  };
}

export type CreateOAuth2ConnectionArgs = {
  id: string;
  name: string;
  description: string;
  authorizeUrl: string;
  tokenUrl: string;
  clientId: string | undefined;
  clientSecret: string | undefined;
  scopes: string[];
  inputConfig?: InputConfig;
  authorizationMethod?: OAuth2AuthorizationMethod;
  pkce?: boolean;
  scopeDelimiter?: string;
  /**
   * If you need to add extra params to the authorize url add them here.
   */
  extraAuthParams?: Record<string, string>;
  /**
   * If you need to add extra heads to the authorize request add them here.
   */
  extraAuthHeaders?: Record<string, string>;
  /**
   * By default we'll use process.env['NGROK_TUNNEL_URL'] with ngrok
   * But there are some platforms like microsoft that only allow one subdomain
   * and since prod is already using the api subdomain, we cant use the tunnel subdomain.
   * So we'll use localhost
   */
  redirectToLocalHostInDevelopment?: boolean;
};

/**
 * Most APIs use the body to send the authorization token
 * but some use the header to pass the client id and secret.
 *
 * For example, the Notion API uses the header to pass the client id and secret
 */
export type OAuth2AuthorizationMethod = 'body' | 'header';

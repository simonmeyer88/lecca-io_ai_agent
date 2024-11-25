import {
  ConnectionConstructorArgs,
  ConnectionType,
  OAuth2Connection,
} from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ZohoCrm } from '../zoho-crm.app';
import { ServerConfig } from '@/config/server.config';

export class ZohoCrmOAuth2US extends OAuth2Connection {
  constructor(args: ConnectionConstructorArgs) {
    super(args);
  }

  app: ZohoCrm;
  location = 'com';
  id() {
    return 'zoho-crm-connection-oauth2-US';
  }
  name() {
    return 'zoho.com';
  }
  description() {
    return 'Connect to Zoho on the US data center (zoho.com)';
  }
  inputConfig(): InputConfig[] {
    return [];
  }
  connectionType(): ConnectionType {
    return 'oauth2';
  }
  authorizeUrl(): string {
    return `https://accounts.zoho.${this.location}/oauth/v2/auth`;
  }
  tokenUrl(): string {
    return `https://accounts.zoho.${this.location}/oauth/v2/token`;
  }
  clientId(): string {
    return ServerConfig.INTEGRATIONS.ZOHO_CRM_CLIENT_ID;
  }
  clientSecret(): string {
    return ServerConfig.INTEGRATIONS.ZOHO_CRM_CLIENT_SECRET;
  }
  scopes(): string[] {
    return [
      'ZohoCRM.users.ALL',
      'ZohoCRM.org.ALL',
      'ZohoCRM.settings.ALL',
      'ZohoCRM.modules.ALL',
      'ZohoCRM.bulk.ALL',
      'ZohoCRM.bulk.backup.ALL',
      'ZohoFiles.files.ALL',
    ];
  }
  extraAuthParams(): Record<string, string> | null {
    return {
      prompt: 'consent',
      access_type: 'offline',
    };
  }
}

import {
  ConnectionConstructorArgs,
  ConnectionType,
  OAuth2Connection,
} from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { MicrosoftOutlook } from '../microsoft-outlook.app';

export class MicrosoftOutlookOAuth2 extends OAuth2Connection {
  constructor(args: ConnectionConstructorArgs) {
    super(args);
  }

  app: MicrosoftOutlook;
  id() {
    return 'microsoft-outlook-connection-oauth2';
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
    return 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
  }
  tokenUrl(): string {
    return 'https://login.microsoftonline.com/common/oauth2/v2.0/token';
  }
  clientId(): string {
    return ServerConfig.INTEGRATIONS.MICROSOFT_OUTLOOK_CLIENT_ID;
  }
  clientSecret(): string {
    return ServerConfig.INTEGRATIONS.MICROSOFT_OUTLOOK_CLIENT_SECRET;
  }
  scopes(): string[] {
    return [
      'Mail.Send',
      'Mail.ReadWrite',
      'Calendars.ReadWrite',
      'Contacts.ReadWrite',
      'offline_access',
      'User.Read',
    ];
  }
  redirectToLocalHostInDevelopment(): boolean {
    //Microsoft only supports one subdomain and production is already using the api subdomain
    //so we can't use the tunnel subdomain for development.
    return true;
  }
}

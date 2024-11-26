import {
  ConnectionConstructorArgs,
  ConnectionType,
  OAuth2Connection,
} from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { MicrosoftExcel365 } from '../microsoft-excel-365.app';

export class MicrosoftExcel365OAuth2 extends OAuth2Connection {
  constructor(args: ConnectionConstructorArgs) {
    super(args);
  }

  app: MicrosoftExcel365;
  id() {
    return 'microsoft-excel-365-connection-oauth2';
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
    return ServerConfig.INTEGRATIONS.MICROSOFT_365_EXCEL_CLIENT_ID;
  }
  clientSecret(): string {
    return ServerConfig.INTEGRATIONS.MICROSOFT_365_EXCEL_CLIENT_SECRET;
  }
  scopes(): string[] {
    return ['Files.ReadWrite', 'User.Read', 'offline_access'];
  }
  redirectToLocalHostInDevelopment(): boolean {
    //Microsoft only supports one subdomain and production is already using the api subdomain
    //so we can't use the tunnel subdomain for development.
    return true;
  }
}

import {
  ConnectionConstructorArgs,
  OAuth2Connection,
} from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { Hubspot } from '../hubspot.app';

export class HubSpotOAuth2 extends OAuth2Connection {
  constructor(args: ConnectionConstructorArgs) {
    super(args);
  }

  app: Hubspot;
  id() {
    return 'hubspot-connection-oauth2';
  }
  name() {
    return 'OAuth2';
  }
  description() {
    return 'Connect to HubSpot using OAuth2';
  }
  inputConfig(): InputConfig[] {
    return [];
  }
  authorizeUrl(): string {
    return 'https://app.hubspot.com/oauth/authorize';
  }
  tokenUrl(): string {
    return 'https://api.hubapi.com/oauth/v1/token';
  }
  clientId(): string {
    return ServerConfig.INTEGRATIONS.HUBSPOT_CLIENT_ID;
  }
  clientSecret(): string {
    return ServerConfig.INTEGRATIONS.HUBSPOT_CLIENT_SECRET;
  }
  scopes(): string[] {
    return [
      'crm.lists.read',
      'crm.lists.write',
      'crm.objects.companies.read',
      'crm.objects.companies.write',
      'crm.objects.contacts.read',
      'crm.objects.contacts.write',
      'crm.objects.deals.read',
      'crm.objects.deals.write',
      'crm.objects.line_items.read',
      'crm.objects.line_items.write',
      'crm.objects.owners.read',
      'crm.schemas.companies.read',
      'crm.schemas.contacts.read',
      'crm.schemas.deals.read',
      'crm.schemas.line_items.read',
    ];
  }
  scopeDelimiter(): string {
    return ' ';
  }
  extraAuthParams(): Record<string, string> | null {
    return {
      optional_scope: 'tickets',
    };
  }
}

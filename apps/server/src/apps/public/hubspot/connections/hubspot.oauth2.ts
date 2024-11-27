import { OAuth2Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { Hubspot } from '../hubspot.app';

export class HubSpotOAuth2 extends OAuth2Connection {
  app: Hubspot;
  id = 'hubspot_connection_oauth2';
  name = 'OAuth2';
  description = 'Connect to HubSpot using OAuth2';
  inputConfig: InputConfig[] = [];
  authorizeUrl = 'https://app.hubspot.com/oauth/authorize';
  tokenUrl = 'https://api.hubapi.com/oauth/v1/token';
  clientId = ServerConfig.INTEGRATIONS.HUBSPOT_CLIENT_ID;
  clientSecret = ServerConfig.INTEGRATIONS.HUBSPOT_CLIENT_SECRET;
  scopes = [
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
  scopeDelimiter = ' ';
  extraAuthParams = {
    optional_scope: 'tickets',
  };
}

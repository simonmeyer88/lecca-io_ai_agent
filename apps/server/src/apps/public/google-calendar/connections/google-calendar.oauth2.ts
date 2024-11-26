import {
  ConnectionConstructorArgs,
  OAuth2Connection,
} from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { GoogleCalendar } from '../google-calendar.app';

export class GoogleCalendarOAuth2 extends OAuth2Connection {
  constructor(args: ConnectionConstructorArgs) {
    super(args);
  }

  app: GoogleCalendar;
  id() {
    return 'google-calendar-connection-oauth2';
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
  authorizeUrl(): string {
    return 'https://accounts.google.com/o/oauth2/v2/auth';
  }
  tokenUrl(): string {
    return 'https://oauth2.googleapis.com/token';
  }
  clientId(): string {
    return ServerConfig.INTEGRATIONS.GOOGLE_CALENDAR_CLIENT_ID;
  }
  clientSecret(): string {
    return ServerConfig.INTEGRATIONS.GOOGLE_CALENDAR_CLIENT_SECRET;
  }
  scopes(): string[] {
    return [
      'https://www.googleapis.com/auth/calendar.events',
      'https://www.googleapis.com/auth/calendar.readonly',
    ];
  }
  scopeDelimiter(): string {
    return ' ';
  }
  extraAuthParams(): Record<string, string> | null {
    return {
      access_type: 'offline',
      prompt: 'consent',
    };
  }
}

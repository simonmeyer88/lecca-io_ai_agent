import { OAuth2Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { YouTube } from '../youtube.app';

export class YoutubeOAuth2 extends OAuth2Connection {
  app: YouTube;
  id = 'youtube_connection_oauth2';
  name = 'OAuth2';
  description = 'Connect using OAuth2';
  inputConfig: InputConfig[] = [];
  authorizeUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  tokenUrl = 'https://oauth2.googleapis.com/token';
  clientId = ServerConfig.INTEGRATIONS.GMAIL_CLIENT_ID;
  clientSecret = ServerConfig.INTEGRATIONS.GMAIL_CLIENT_SECRET;
  scopes = [
    'https://www.googleapis.com/auth/youtube.upload',
    'https://www.googleapis.com/auth/youtube.readonly',
  ];
  scopeDelimiter = ' ';
  extraAuthParams = {
    access_type: 'offline',
    prompt: 'consent',
  };
}

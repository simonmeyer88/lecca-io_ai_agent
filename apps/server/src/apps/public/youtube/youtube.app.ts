import { google } from 'googleapis';

import { Action } from '@/apps/lib/action';
import { App, AppContructorArgs } from '@/apps/lib/app';
import { Connection } from '@/apps/lib/connection';
import { Trigger } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { SearchVideos } from './actions/search-videos.action';
import { YoutubeOAuth2 } from './connections/youtube.oauth2';

export class YouTube extends App {
  constructor(args: AppContructorArgs) {
    super(args);
  }

  id = 'youtube';
  name = 'Youtube';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description = 'YouTube is an online video sharing platform owned by Google. ';
  isPublished = true;

  connections(): Connection[] {
    return [new YoutubeOAuth2({ app: this })];
  }

  actions(): Action[] {
    return [new SearchVideos({ app: this })];
  }

  triggers(): Trigger[] {
    return [];
  }

  async youtube({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }) {
    const oAuth2Client = this.getOAuth2Client();
    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const youtube = google.youtube({
      version: 'v3',
      auth: oAuth2Client,
    });

    return youtube;
  }

  getOAuth2Client() {
    const GOOGLE_CLIENT_ID = ServerConfig.INTEGRATIONS.YOUTUBE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET =
      ServerConfig.INTEGRATIONS.YOUTUBE_CLIENT_SECRET;
    const GOOGLE_CALLBACK_URL = `${ServerConfig.SERVER_URL}/workflow-apps/oauth2callback`;

    const oAuth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_CALLBACK_URL,
    );

    return oAuth2Client as any;
  }
}

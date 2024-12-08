import { BadRequestException } from '@nestjs/common';
import { google } from 'googleapis';

import { Action } from '@/apps/lib/action';
import { App } from '@/apps/lib/app';
import { Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { Trigger } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { GoogleSlidesOAuth2 } from './connection/google-slides.oauth2';

export class GoogleSlides extends App {
  id = 'google-slides';
  name = 'Google Slides';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description =
    'Google Slides a slideshow presentation program developed by Google.';
  isPublished = true;

  connections(): Connection[] {
    return [new GoogleSlidesOAuth2({ app: this })];
  }

  actions(): Action[] {
    return [];
  }

  triggers(): Trigger[] {
    return [];
  }

  async googleSlides({
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

    return google.slides({
      version: 'v1',
      auth: oAuth2Client,
    });
  }

  async googleDrive({
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

    const sheets = google.drive({
      version: 'v2',
      auth: oAuth2Client,
    });

    return sheets;
  }

  dynamicSelectPresentation(): InputConfig {
    return {
      label: 'Presentation',
      id: 'presentation',
      inputType: 'dynamic-select',
      placeholder: 'Select presentation',
      description: 'The presentation to access',
      _getDynamicValues: async ({ connection }) => {
        const drive = await this.googleDrive({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        //Get all spreadsheets from drive
        const slides = await drive.files.list({
          q: "mimeType='application/vnd.google-apps.presentation'",
        });

        return (
          slides?.data?.items?.map((item) => {
            return {
              value: item.id,
              label: item.title,
            };
          }) ?? []
        );
      },
      required: {
        missingMessage: 'Presentation is required',
        missingStatus: 'warning',
      },
    };
  }

  dynamicSelectSlide(): InputConfig {
    return {
      label: 'Slide',
      id: 'slide',
      inputType: 'dynamic-select',
      placeholder: 'Select slide',
      description: 'The slide to access',
      _getDynamicValues: async ({ connection, extraOptions }) => {
        const presentationId = extraOptions?.presentation;

        if (presentationId === undefined) {
          throw new BadRequestException('Presentation ID is required');
        } else if (typeof presentationId !== 'string') {
          throw new BadRequestException('Presentation ID must be a string');
        }

        const googleSlides = await this.googleSlides({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        const presentations = await googleSlides.presentations.get({
          presentationId,
        });

        return (
          presentations?.data?.slides?.map((slide) => {
            return {
              value: slide.objectId?.toString(),
              label: slide.layoutProperties.displayName,
            };
          }) ?? []
        );
      },
      required: {
        missingMessage: 'Slide is required',
        missingStatus: 'warning',
      },
      loadOptions: {
        dependsOn: ['presentation'],
      },
    };
  }

  getOAuth2Client() {
    const GOOGLE_CLIENT_ID = ServerConfig.INTEGRATIONS.GOOGLE_SLIDES_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET =
      ServerConfig.INTEGRATIONS.GOOGLE_SLIDES_CLIENT_SECRET;
    const GOOGLE_CALLBACK_URL = `${ServerConfig.SERVER_URL}/workflow-apps/oauth2callback`;

    const oAuth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_CALLBACK_URL,
    );

    return oAuth2Client as any;
  }
}

import { google } from 'googleapis';

import { Action } from '@/apps/lib/action';
import { App } from '@/apps/lib/app';
import { Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { Trigger } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { GoogleFormsOAuth2 } from './connections/google-forms.oauth2';
import { NewFormResponse } from './triggers/new-form-response.trigger';

export class GoogleForms extends App {
  id = 'google-forms';
  name = 'Google Forms';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description =
    'Use Google Forms to create online forms and surveys with multiple question types.';
  isPublished = true;

  connections(): Connection[] {
    return [new GoogleFormsOAuth2({ app: this })];
  }

  actions(): Action[] {
    return [];
  }

  triggers(): Trigger[] {
    return [new NewFormResponse({ app: this })];
  }

  async googleForm({
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

    return google.forms({
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
      version: 'v3',
      auth: oAuth2Client,
    });

    return sheets;
  }

  dynamicSelectForm(): InputConfig {
    return {
      label: 'Form',
      id: 'form',
      inputType: 'dynamic-select',
      placeholder: 'Select form',
      description: 'The form to access',
      _getDynamicValues: async ({ connection }) => {
        const googleDrive = await this.googleDrive({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        const forms = await googleDrive.files.list({
          q: "mimeType='application/vnd.google-apps.form' and trashed=false",
        });

        return (
          forms?.data?.files?.map((file) => {
            return {
              value: file.id,
              label: file.name,
            };
          }) ?? []
        );
      },
      required: {
        missingMessage: 'Form is required',
        missingStatus: 'warning',
      },
    };
  }

  getOAuth2Client() {
    const GOOGLE_CLIENT_ID = ServerConfig.INTEGRATIONS.GOOGLE_FORMS_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET =
      ServerConfig.INTEGRATIONS.GOOGLE_FORMS_CLIENT_SECRET;
    const GOOGLE_CALLBACK_URL = `${ServerConfig.SERVER_URL}/workflow-apps/oauth2callback`;

    const oAuth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_CALLBACK_URL,
    );

    return oAuth2Client as any;
  }
}

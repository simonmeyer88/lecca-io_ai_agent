import { google } from 'googleapis';

import { Action } from '@/apps/lib/action';
import { App } from '@/apps/lib/app';
import { Connection } from '@/apps/lib/connection';
import { Trigger } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { CreateContact } from './actions/create-contact.action';
import { GetContact as GetContactByResourceName } from './actions/get-contact-by-resource-name.action';
import { ListContacts } from './actions/list-contacts.action';
import { GoogleContactsOAuth2 } from './connections/google-contacts.oauth2';

export class GoogleContacts extends App {
  id = 'google-contacts';
  name = 'Google Contacts';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description =
    'Google Contacts allows users to store and manage their contacts across multiple devices';
  isPublished = true;

  connections(): Connection[] {
    return [new GoogleContactsOAuth2({ app: this })];
  }

  actions(): Action[] {
    return [
      new CreateContact({ app: this }),
      new ListContacts({ app: this }),
      new GetContactByResourceName({ app: this }),
    ];
  }

  triggers(): Trigger[] {
    return [];
  }

  async googleContacts({
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

    const sheets = google.people({
      version: 'v1',
      auth: oAuth2Client,
    });

    return sheets;
  }

  getOAuth2Client() {
    const GOOGLE_CLIENT_ID =
      ServerConfig.INTEGRATIONS.GOOGLE_CONTACTS_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET =
      ServerConfig.INTEGRATIONS.GOOGLE_CONTACTS_CLIENT_SECRET;
    const GOOGLE_CALLBACK_URL = `${ServerConfig.SERVER_URL}/workflow-apps/oauth2callback`;

    const oAuth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_CALLBACK_URL,
    );

    return oAuth2Client as any;
  }
}

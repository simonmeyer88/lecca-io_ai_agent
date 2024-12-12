import { google } from 'googleapis';

export const shared = {
  googleContacts({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }) {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.INTEGRATION_GOOGLE_CONTACTS_CLIENT_ID,
      process.env.INTEGRATION_GOOGLE_CONTACTS_CLIENT_SECRET,
      `${process.env.SERVER_URL}/workflow-apps/oauth2callback`,
    );

    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    return google.people({
      version: 'v1',
      auth: oAuth2Client,
    });
  },
};

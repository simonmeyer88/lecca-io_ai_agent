import { google } from 'googleapis';

import { Action } from '@/apps/lib/action';
import { Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { Trigger } from '@/apps/lib/trigger';
import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { ServerConfig } from '@/config/server.config';

import { AddGuestsToEvent } from './actions/add-guests-to-event.action';
import { CreateEvent } from './actions/create-event.action';
import { ListCalendars } from './actions/list-calendars.action';
import { ListEvents } from './actions/list-events.action';
import { UpdateEvent } from './actions/update-event.action';
import { GoogleCalendarOAuth2 } from './connections/google-calendar.oauth2';
import { NewCalendarEvent } from './triggers/new-calendar-event.trigger';

export class GoogleCalendar extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

  id = 'google-calendar';
  name = 'Google Calendar';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description =
    'Google Calendar is a time-management and scheduling calendar service developed by Google';
  isPublished = true;

  connections(): Connection[] {
    return [new GoogleCalendarOAuth2({ app: this })];
  }

  actions(): Action[] {
    return [
      new CreateEvent({ app: this }),
      new UpdateEvent({ app: this }),
      new AddGuestsToEvent({ app: this }),
      new ListCalendars({ app: this }),
      new ListEvents({ app: this }),
    ];
  }

  triggers(): Trigger[] {
    return [new NewCalendarEvent({ app: this })];
  }

  async googleCalendar({
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

    const sheets = google.calendar({
      version: 'v3',
      auth: oAuth2Client,
    });

    return sheets;
  }

  getOAuth2Client() {
    const GOOGLE_CLIENT_ID =
      ServerConfig.INTEGRATIONS.GOOGLE_CALENDAR_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET =
      ServerConfig.INTEGRATIONS.GOOGLE_CALENDAR_CLIENT_SECRET;
    const GOOGLE_CALLBACK_URL = `${ServerConfig.SERVER_URL}/workflow-apps/oauth2callback`;

    const oAuth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_CALLBACK_URL,
    );

    return oAuth2Client as any;
  }

  dynamicSelectCalendar(args?: { includeType?: 'all' }): InputConfig {
    return {
      label: 'Calendar',
      id: 'calendarId',
      inputType: 'dynamic-select',
      placeholder: 'Select a calendar',
      description: 'Calendar ID',
      required: {
        missingMessage: 'Calendar is required',
        missingStatus: 'warning',
      },
      _getDynamicValues: async ({ connection }) => {
        const googleCalendar = await this.googleCalendar({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        const response = await googleCalendar.calendarList.list();
        const calendars = response.data.items;

        return calendars
          .filter((calendar) => {
            return args?.includeType === 'all'
              ? true
              : calendar.accessRole === 'owner' ||
                  calendar.accessRole === 'writer';
          })
          .map((calendar: any) => ({
            value: calendar.id,
            label: calendar.summary,
          }));
      },
    };
  }

  dynamicSelectEvent(): InputConfig {
    return {
      label: 'Event',
      id: 'eventId',
      inputType: 'dynamic-select',
      placeholder: 'Select an event',
      description: 'Event ID',
      required: {
        missingMessage: 'Event is required',
        missingStatus: 'warning',
      },
      loadOptions: {
        dependsOn: ['calendarId'],
        forceRefresh: true,
      },
      _getDynamicValues: async ({ connection, extraOptions }) => {
        const { calendarId } = extraOptions;

        if (calendarId == null) {
          throw new Error('Calendar ID is required');
        }

        const googleCalendar = await this.googleCalendar({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        const response = await googleCalendar.events.list({
          calendarId: calendarId,
          timeMin: new Date().toISOString(),
          orderBy: 'updated',
        });

        const events = response.data.items;

        //reverseing so updated events are at the top
        return events.reverse().map((event: any) => ({
          value: event.id,
          label: event.summary,
        }));
      },
    };
  }

  getMockEvent() {
    return {
      kind: 'calendar#event',
      etag: '"0000000000000000"',
      id: 'calendar_event_id',
      status: 'confirmed',
      htmlLink: 'https://www.google.com/calendar/event?eid=some_id',
      updated: '2024-08-08T22:10:54.757Z',
      summary: 'Event Summary',
      location: 'Event Location',
      description: 'Event Description',
      creator: { email: 'test@gmail.com' },
      organizer: {
        email: 'email@test.com',
        displayName: 'Name',
        self: true,
      },
      start: {
        dateTime: '2024-08-09T05:00:00-06:00',
        timeZone: 'America/Denver',
      },
      end: {
        dateTime: '2024-08-09T06:00:00-06:00',
        timeZone: 'America/Denver',
      },
      attendees: [
        { email: 'existing.user@example.com' },
        { email: 'new.guest@example.com' },
      ],
      iCalUID: 'some-id@google.com',
      sequence: 1,
      reminders: { useDefault: true },
      eventType: 'default',
    };
  }
}

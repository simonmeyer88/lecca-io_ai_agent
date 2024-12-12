import { createDynamicSelectInputField } from '@lecca-io/toolkit';
import { google } from 'googleapis';

export const shared = {
  fields: {
    dynamicSelectCalendar: (args?: { includeType?: 'all' }) => {
      return createDynamicSelectInputField({
        label: 'Calendar',
        id: 'calendarId',
        placeholder: 'Select a calendar',
        description: 'Calendar ID',
        required: {
          missingMessage: 'Calendar is required',
          missingStatus: 'warning',
        },
        _getDynamicValues: async ({ connection }) => {
          const googleCalendar = shared.googleCalendar({
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
      });
    },
    dynamicSelectEvent: createDynamicSelectInputField({
      label: 'Event',
      id: 'eventId',
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

        const googleCalendar = shared.googleCalendar({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        const response = await googleCalendar.events.list({
          calendarId: calendarId,
          timeMin: new Date().toISOString(),
          orderBy: 'updated',
        });

        const events = response.data.items;

        //reversing so updated events are at the top
        return events.reverse().map((event: any) => ({
          value: event.id,
          label: event.summary,
        }));
      },
    }),
  },
  googleCalendar({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }) {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.INTEGRATION_GOOGLE_CALENDAR_CLIENT_ID,
      process.env.INTEGRATION_GOOGLE_CALENDAR_CLIENT_SECRET,
      `${process.env.SERVER_URL}/workflow-apps/oauth2callback`,
    );

    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    return google.calendar({
      version: 'v3',
      auth: oAuth2Client,
    });
  },
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
  },
};

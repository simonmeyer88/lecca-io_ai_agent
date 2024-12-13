import {
  createTimeBasedPollTrigger,
  dateStringToMilliOrNull,
} from '@lecca-io/toolkit';

import { shared } from '../shared/google-calendar.shared';

export const newCalendarEvent = createTimeBasedPollTrigger({
  id: 'google-calendar_trigger_new-calendar-event',
  name: 'New Calendar Event',
  description: 'Triggers when a new event is created in a specified calendar',
  inputConfig: [shared.fields.dynamicSelectCalendar({ includeType: 'all' })],
  run: async ({ connection, configValue }) => {
    const googleCalendar = shared.googleCalendar({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { calendarId } = configValue;

    // Fetch events from the specified calendar
    const events = await googleCalendar.events.list({
      calendarId: calendarId ?? 'primary',
      // Fetch events updated in the last 24 hours (optional)
      // Just to make sure we dont miss any
      updatedMin: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
      showDeleted: false,
      singleEvents: false,
      orderBy: 'updated',
    });

    const sortedEvents = events.data.items.sort((a, b) => {
      return new Date(b.created).getTime() - new Date(a.created).getTime();
    });

    return sortedEvents.map((event) => ({
      id: event.id,
      summary: event.summary,
      start: event.start,
      end: event.end,
      created: event.created,
      updated: event.updated,
      htmlLink: event.htmlLink,
      location: event.location,
      description: event.description,
      attendees: event.attendees,
    }));
  },
  mockRun: async () => {
    return [shared.getMockEvent()];
  },
  extractTimestampFromResponse({ response }: { response: any }) {
    if (response.created) {
      return dateStringToMilliOrNull(response.created);
    } else {
      return null;
    }
  },
});

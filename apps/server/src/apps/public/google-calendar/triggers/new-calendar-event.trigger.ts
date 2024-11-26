import { InputConfig } from '@/apps/lib/input-config';
import {
  RunTriggerArgs,
  TimeBasedPollTrigger,
  TriggerConstructorArgs,
} from '@/apps/lib/trigger';
import { DateStringToMilliOrNull } from '@/apps/utils/date-string-to-milli-or-null';

import { GoogleCalendar } from '../google-calendar.app';

export class NewCalendarEvent extends TimeBasedPollTrigger {
  constructor(args: TriggerConstructorArgs) {
    super(args);
  }

  app: GoogleCalendar;

  id() {
    return 'google-calendar_trigger_new-calendar-event';
  }

  name() {
    return 'New Calendar Event';
  }

  description() {
    return 'Triggers when a new event is created in a specified calendar';
  }

  inputConfig(): InputConfig[] {
    return [this.app.dynamicSelectCalendar({ includeType: 'all' })];
  }

  async run({
    connection,
    configValue,
  }: RunTriggerArgs<{ calendarId: string }>): Promise<any[]> {
    const googleCalendar = await this.app.googleCalendar({
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
  }

  async mockRun(): Promise<any[]> {
    return [this.app.getMockEvent()];
  }

  extractTimestampFromResponse({ response }: { response: any }) {
    if (response.created) {
      return DateStringToMilliOrNull(response.created);
    } else {
      return null;
    }
  }
}

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { GoogleCalendar } from '../google-calendar.app';

import { InputConfig } from '@/apps/lib/input-config';
import { z } from 'zod';

export class ListCalendars extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleCalendar;
  id() {
    return 'google-calendar_action_list-calendars';
  }
  name() {
    return 'List Calendars';
  }
  description() {
    return 'Lists all calendars for the authenticated user.';
  }
  aiSchema() {
    return z.object({});
  }
  inputConfig(): InputConfig[] {
    return [];
  }

  async run({ connection }: RunActionArgs<ConfigValue>): Promise<Response> {
    const googleCalendar = await this.app.googleCalendar({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const response = await googleCalendar.calendarList.list();

    return {
      calendars: response.data.items,
    } as unknown as Response;
  }

  async mockRun(): Promise<Response> {
    return {
      calendars: [mock],
    };
  }
}

const mock = {
  kind: 'calendar#calendarListEntry',
  etag: '"1000000000000000"',
  id: 'your_calendar_id',
  summary: 'Calendar Name',
  description: 'Calendar Description',
  timeZone: 'America/Denver',
  colorId: '19',
  backgroundColor: '#c2c2c2',
  foregroundColor: '#000000',
  selected: true,
  accessRole: 'owner',
};

type Response = {
  calendars: (typeof mock)[];
};

type ConfigValue = z.infer<ReturnType<ListCalendars['aiSchema']>>;

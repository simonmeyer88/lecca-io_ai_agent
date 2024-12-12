import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-calendar.shared';

export const listCalendars = createAction({
  id: 'google-calendar_action_list-calendars',
  name: 'List Calendars',
  description: 'Lists all calendars for the authenticated user.',
  inputConfig: [],
  aiSchema: z.object({}),
  run: async ({ connection }) => {
    const googleCalendar = shared.googleCalendar({
      accessToken: connection?.accessToken,
      refreshToken: connection?.refreshToken,
    });

    const response = await googleCalendar.calendarList.list();

    return {
      calendars: response.data.items,
    };
  },
  mockRun: async () => {
    return {
      calendars: [mock],
    };
  },
});

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

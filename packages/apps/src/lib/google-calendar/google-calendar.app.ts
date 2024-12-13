import { createApp } from '@lecca-io/toolkit';

import { addGuestsToEvent } from './actions/add-guests-to-event.action';
import { createEvent } from './actions/create-event.action';
import { listCalendars } from './actions/list-calendars.action';
import { listEvents } from './actions/list-events.action';
import { updateEvent } from './actions/update-event.action';
import { googleCalendarOAuth2 } from './connections/google-calendar.oauth2';
import { newCalendarEvent } from './triggers/new-calendar-event.trigger';

export const googleCalendar = createApp({
  id: 'google-calendar',
  name: 'Google Calendar',
  description:
    'Google Calendar is a time-management and scheduling calendar service developed by Google',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/google-calendar.svg',
  actions: [
    createEvent,
    updateEvent,
    addGuestsToEvent,
    listCalendars,
    listEvents,
  ],
  triggers: [newCalendarEvent],
  connections: [googleCalendarOAuth2],
  needsConnection: true,
});

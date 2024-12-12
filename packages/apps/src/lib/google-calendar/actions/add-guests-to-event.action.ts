import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-calendar.shared';

export const addGuestsToEvent = createAction({
  id: 'google-calendar_action_add-guests-to-event',
  name: 'Add Guests to Event',
  description: 'Adds a guest to an existing event.',
  inputConfig: [
    shared.fields.dynamicSelectCalendar(),
    shared.fields.dynamicSelectEvent,
    {
      id: 'guestEmails',
      label: 'Guest Emails',
      description: '',
      placeholder: 'Enter an email address',
      inputType: 'text',
      occurenceType: 'multiple',
      required: {
        missingMessage: 'Guest email is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'sendNotifications',
      label: 'Send Notifications',
      description: 'Send notifications to guests',
      inputType: 'select',
      selectOptions: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
      defaultValue: 'true',
    },
  ],
  aiSchema: z.object({
    calendarId: z.string().nullable().optional().describe('Calendar ID'),
    eventId: z.string().min(1).describe('Event ID'),
    guestEmails: z.array(z.string().min(1)).describe('Guest Email'),
    sendNotifications: z
      .enum(['true', 'false'])
      .nullable()
      .optional()
      .describe('Send notifications to guests'),
  }),
  run: async ({ configValue, connection }) => {
    const googleCalendar = shared.googleCalendar({
      accessToken: connection?.accessToken,
      refreshToken: connection?.refreshToken,
    });

    const { calendarId, eventId, guestEmails, sendNotifications } = configValue;

    const event = await googleCalendar.events.get({
      calendarId: calendarId ?? 'primary',
      eventId,
    });

    const existingAttendees = event.data.attendees || [];
    const newAttendees = guestEmails.map((email) => ({ email }));

    const updatedEvent = await googleCalendar.events.patch({
      calendarId: calendarId ?? 'primary',
      eventId,
      requestBody: {
        attendees: [...existingAttendees, ...newAttendees],
      },
      sendNotifications: sendNotifications === 'true',
    });

    return updatedEvent.data;
  },
  mockRun: async () => {
    return shared.getMockEvent();
  },
});

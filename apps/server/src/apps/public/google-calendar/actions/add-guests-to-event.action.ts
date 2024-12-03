import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { GoogleCalendar } from '../google-calendar.app';

export class AddGuestsToEvent extends Action {
  app: GoogleCalendar;

  id = 'google-calendar_action_add-guests-to-event';
  name = 'Add Guests to Event';
  description = 'Adds a guest to an existing event.';
  aiSchema = z.object({
    calendarId: z.string().nullable().optional().describe('Calendar ID'),
    eventId: z.string().min(1).describe('Event ID'),
    guestEmails: z.array(z.string().min(1)).describe('Guest Email'),
    sendNotifications: z
      .enum(['true', 'false'])
      .nullable()
      .optional()
      .describe('Send notifications to guests'),
  });
  inputConfig: InputConfig[] = [
    this.app.dynamicSelectCalendar(),
    this.app.dynamicSelectEvent(),
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
  ];

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<any> {
    const googleCalendar = await this.app.googleCalendar({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
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
  }

  async mockRun(): Promise<any> {
    return this.app.getMockEvent();
  }
}

type ConfigValue = z.infer<AddGuestsToEvent['aiSchema']>;

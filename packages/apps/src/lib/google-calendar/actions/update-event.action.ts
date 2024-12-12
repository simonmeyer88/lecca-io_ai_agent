import {
  createAction,
  parseDateToISO,
  timezoneDropdown,
} from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-calendar.shared';

export const updateEvent = createAction({
  id: 'google-calendar_action_update-event',
  name: 'Update Event',
  description: 'Updates an event.',
  aiSchema: z.object({
    calendarId: z.string().nullable().optional().describe('Calendar ID'),
    eventId: z.string().min(1).describe('Event ID'),
    summary: z.string().min(1).nullable().optional().describe('Event summary'),
    location: z.string().nullable().optional().describe('Event location'),
    description: z.string().nullable().optional().describe('Event description'),
    startDateTime: z
      .string()
      .min(1)
      .nullable()
      .optional()
      .describe('Event start time in ISO String format with timezone or UTC'),
    endDateTime: z
      .string()
      .min(1)
      .nullable()
      .optional()
      .describe('Event end time in ISO String format with timezone or UTC'),
    timeZone: z
      .string()
      .min(1)
      .nullable()
      .optional()
      .describe(
        "IANA Time Zones follows this convention: {AREA}/{LOCATION}. Ask user if you don't know the timezone",
      ),
    sendNotifications: z
      .enum(['true', 'false'])
      .nullable()
      .optional()
      .describe('Send notifications to guests'),
    createConferenceLink: z
      .enum(['true', 'false'])
      .nullable()
      .optional()
      .describe('Create Google Meet Link'),
  }),
  inputConfig: [
    shared.fields.dynamicSelectCalendar(),
    shared.fields.dynamicSelectEvent,
    {
      id: 'summary',
      label: 'Summary',
      description: 'Event summary',
      inputType: 'text',
    },
    {
      id: 'location',
      label: 'Location',
      description: 'Event location',
      inputType: 'text',
    },
    {
      id: 'description',
      label: 'Description',
      description: 'Event description',
      inputType: 'text',
    },
    {
      id: 'startDateTime',
      label: 'Start Time',
      description: 'Event start time in ISO String format with timezone or UTC',
      inputType: 'date-time',
    },
    {
      id: 'endDateTime',
      label: 'End Time',
      description: 'Event end time in ISO String format with timezone or UTC',
      inputType: 'date-time',
    },
    {
      id: 'timeZone',
      label: 'Time Zone',
      description: 'Event time zone',
      inputType: 'dynamic-select',
      _getDynamicValues: async () => {
        return timezoneDropdown;
      },
      selectOptions: [
        {
          value: 'default',
          label: 'Default (Calendar Time Zone)',
        },
      ],
      defaultValue: 'default',
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
    {
      id: 'createConferenceLink',
      label: 'Create Google Meet Link',
      description: 'Create Google Meet Link',
      inputType: 'select',
      selectOptions: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
      defaultValue: 'false',
    },
  ],
  run: async ({ configValue, connection, workspaceId }) => {
    const googleCalendar = shared.googleCalendar({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const {
      calendarId,
      eventId,
      summary,
      location,
      description,
      startDateTime: startDateTimeRaw,
      endDateTime: endDateTimeRaw,
      timeZone,
      sendNotifications,
      createConferenceLink,
    } = configValue;

    const startDateTime = startDateTimeRaw
      ? parseDateToISO(startDateTimeRaw)
      : undefined;
    const endDateTime = endDateTimeRaw
      ? parseDateToISO(endDateTimeRaw)
      : undefined;

    const event = await googleCalendar.events.patch({
      calendarId: calendarId ?? 'primary',
      eventId,
      requestBody: {
        summary,
        location,
        description,
        start: startDateTime
          ? {
              dateTime: startDateTime,
              timeZone:
                !timeZone || timeZone === 'default' ? undefined : timeZone,
            }
          : undefined,
        end: endDateTime
          ? {
              dateTime: endDateTime,
              timeZone:
                !timeZone || timeZone === 'default' ? undefined : timeZone,
            }
          : undefined,
        conferenceData:
          createConferenceLink === 'true'
            ? {
                createRequest: {
                  requestId: `${workspaceId}-${Date.now()}`,
                  conferenceSolutionKey: {
                    type: 'hangoutsMeet',
                  },
                },
              }
            : undefined,
      },
      sendNotifications: sendNotifications === 'true',
      conferenceDataVersion: createConferenceLink === 'true' ? 1 : undefined,
    });

    return event.data;
  },
  mockRun: async () => {
    return shared.getMockEvent();
  },
});

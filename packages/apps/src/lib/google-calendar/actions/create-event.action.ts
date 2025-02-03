import {
  createAction,
  parseDateToISO,
  timezoneDropdown,
} from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-calendar.shared';

export const createEvent = createAction({
  id: 'google-calendar_action_create-event',
  name: 'Create Event',
  description: 'Creates an event in your selected calendar.',
  inputConfig: [
    shared.fields.dynamicSelectCalendar(),
    {
      id: 'summary',
      label: 'Summary',
      description: 'Event summary',
      inputType: 'text',
      required: {
        missingMessage: 'Summary is required',
        missingStatus: 'warning',
      },
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
      required: {
        missingMessage: 'Start DateTime is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'endDateTime',
      label: 'End Time',
      description: 'Event end time in ISO String format with timezone or UTC',
      inputType: 'date-time',
      required: {
        missingMessage: 'End DateTime is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'timeZone',
      label: 'Start Time Zone',
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
      id: 'guests',
      label: 'Additional Guests',
      description: '',
      placeholder: 'Enter an email address',
      inputType: 'text',
      occurenceType: 'multiple',
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
      description: '',
      inputType: 'select',
      selectOptions: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
      defaultValue: 'false',
    },
  ],
  aiSchema: z.object({
    calendarId: z.string().nullable().optional().describe('Calendar ID'),
    summary: z.string().describe('Event summary'),
    location: z.string().nullable().optional().describe('Event location'),
    description: z.string().nullable().optional().describe('Event description'),
    startDateTime: z
      .string()
      .describe('Event start time in ISO String format with timezone or UTC'),
    endDateTime: z
      .string()
      .describe('Event end time in ISO String format with timezone or UTC'),
    timeZone: z
      .string()
      .nullable()
      .optional()
      .describe(
        "IANA Time Zones follows this convention: {AREA}/{LOCATION}. Ask user if you don't know the timezone",
      ),
    guests: z
      .array(z.string())
      .nullable()
      .optional()
      .describe('guests email addresses'),
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
  run: async ({ configValue, connection, workspaceId }) => {
    const googleCalendar = shared.googleCalendar({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const {
      calendarId,
      summary,
      location,
      description,
      startDateTime: startDateTimeRaw,
      endDateTime: endDateTimeRaw,
      timeZone,
      guests,
      sendNotifications,
      createConferenceLink,
    } = configValue;

    const startDateTime = parseDateToISO(startDateTimeRaw);
    const endDateTime = parseDateToISO(endDateTimeRaw);

    const event = await googleCalendar.events.insert({
      calendarId: calendarId ?? 'primary',
      requestBody: {
        summary,
        location,
        description,
        start: {
          dateTime: startDateTime,
          timeZone: !timeZone || timeZone === 'default' ? undefined : timeZone,
        },
        end: {
          dateTime: endDateTime,
          timeZone: !timeZone || timeZone === 'default' ? undefined : timeZone,
        },
        attendees: guests?.map((email: string) => ({ email })) || [],
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

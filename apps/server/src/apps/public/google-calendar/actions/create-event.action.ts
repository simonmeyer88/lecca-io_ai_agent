import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { parseDateToISO } from '@/apps/utils/parse-date-to-iso';
import { timezoneDropdown } from '@/apps/utils/timezones';

import { GoogleCalendar } from '../google-calendar.app';

export class CreateEvent extends Action {
  app: GoogleCalendar;
  id = 'google-calendar_action_create-event';
  name = 'Create Event';
  description = 'Creates an event in your selected calendar.';
  aiSchema = z.object({
    calendarId: z.string().nullable().optional().describe('Calendar ID'),
    summary: z.string().min(1).describe('Event summary'),
    location: z.string().nullable().optional().describe('Event location'),
    description: z.string().nullable().optional().describe('Event description'),
    startDateTime: z
      .string()
      .min(1)
      .describe('Event start time in ISO String format with timezone or UTC'),
    endDateTime: z
      .string()
      .min(1)
      .describe('Event end time in ISO String format with timezone or UTC'),
    timeZone: z
      .string()
      .min(1)
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
  });
  inputConfig: InputConfig[] = [
    this.app.dynamicSelectCalendar(),
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
  ];

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<any> {
    const googleCalendar = await this.app.googleCalendar({
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
        // colorId: colorId || undefined, //If it's not provided or 0, then we'll use default
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
      conferenceDataVersion: createConferenceLink === 'true' ? 1 : undefined, // Add this line to enable Google Meet
    });

    return event.data;
  }

  async mockRun(): Promise<any> {
    return this.app.getMockEvent();
  }
}

type ConfigValue = z.infer<CreateEvent['aiSchema']>;

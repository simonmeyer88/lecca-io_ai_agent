import { createAction, parseDateToISO } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/google-calendar.shared';

export const listEvents = createAction({
  id: 'google-calendar_action_list-events',
  name: 'List Events',
  description:
    'Lists events from Google Calendar within a specified date range.',
  inputConfig: [
    shared.fields.dynamicSelectCalendar(),
    {
      id: 'startDate',
      label: 'Start Date',
      description: 'Start date in ISO String format with timezone or UTC',
      inputType: 'date-time',
      required: {
        missingMessage: 'Start date is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'endDate',
      label: 'End Date',
      description: 'End date in ISO String format with timezone or UTC',
      inputType: 'date-time',
      required: {
        missingMessage: 'End date is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'singleEvents',
      label: 'Single Events',
      description:
        'Whether to expand recurring events into instances and only return single one-off events and instances',
      inputType: 'select',
      selectOptions: [
        { value: 'true', label: 'Yes' },
        { value: 'false', label: 'No' },
      ],
      defaultValue: 'true',
    },
    {
      id: 'orderBy',
      label: 'Order By',
      description: 'The order of the events',
      inputType: 'select',
      selectOptions: [
        { value: 'updated', label: 'Updated' },
        { value: 'startTime', label: 'Start Time' },
      ],
      defaultValue: 'updated',
    },
    {
      id: 'maxResults',
      label: 'Max Results',
      description: 'Maximum number of events to return',
      numberOptions: {
        min: 1,
        max: 20,
      },
      inputType: 'number',
      defaultValue: 10,
    },
  ],
  aiSchema: z.object({
    calendarId: z.string().nullable().optional().describe('Calendar ID'),
    startDate: z
      .string()
      .describe('Start date must be in ISO String format with timezone or UTC'),
    endDate: z
      .string()
      .describe('End date must be in ISO String format with timezone or UTC'),
    singleEvents: z.enum(['true', 'false']),
    orderBy: z.enum(['startTime', 'updated']),
    maxResults: z.number().min(1).max(20),
  }),
  run: async ({ configValue, connection }) => {
    const googleCalendar = shared.googleCalendar({
      accessToken: connection?.accessToken,
      refreshToken: connection?.refreshToken,
    });

    const {
      calendarId,
      startDate: startDateTimeRaw,
      endDate: endDateTimeRaw,
      singleEvents,
      orderBy,
      maxResults,
    } = configValue;

    const startDate = parseDateToISO(startDateTimeRaw);
    const endDate = parseDateToISO(endDateTimeRaw);

    //startTime orderBy only works with singleEvents set to true
    const actualOrderBy = singleEvents === 'true' ? orderBy : 'updated';

    const response = await googleCalendar.events.list({
      calendarId: calendarId ?? 'primary',
      timeMin: startDate,
      timeMax: endDate,
      showDeleted: false,
      singleEvents: singleEvents === 'true',
      orderBy: actualOrderBy,
      maxResults: maxResults,
    });

    if (actualOrderBy === 'updated') {
      // Reverse so the latest updated event is first
      response.data.items = response.data.items.reverse();
    }

    return { events: response.data.items };
  },
  mockRun: async () => {
    return {
      events: [shared.getMockEvent()],
    };
  },
});

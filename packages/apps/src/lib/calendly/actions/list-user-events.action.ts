import {
  createAction,
  createDateTimeInputField,
  createNumberInputField,
  createSelectInputField,
  createTextInputField,
  parseDateToISO,
} from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/calendly.shared';

const listUserEvents = createAction({
  id: 'calendly_action_list-user-events',
  name: 'List User Events',
  description: 'Retrieves a list of events for a specific user.',
  inputConfig: [
    shared.fields.dynamicSelectUser,
    createDateTimeInputField({
      id: 'startDateTime',
      label: 'Start Date',
      description:
        'Filter events that occur after this start time (ISO format)',
    }),
    createDateTimeInputField({
      id: 'endDateTime',
      label: 'End Date',
      description: 'Filter events that occur before this end time (ISO format)',
    }),
    createTextInputField({
      id: 'inviteeEmail',
      label: 'Invitee Email',
      description: 'Only return events with this invitee email',
      placeholder: 'Add email',
    }),
    createSelectInputField({
      id: 'status',
      label: 'Status',
      description: 'Filter events by status',
      selectOptions: [
        { label: 'All', value: 'all' },
        { label: 'Active', value: 'active' },
        { label: 'Canceled', value: 'canceled' },
      ],
      defaultValue: 'all',
    }),
    createNumberInputField({
      id: 'count',
      label: 'Count',
      description: 'Number of events to return. Maximum is 50',
      defaultValue: 20,
      placeholder: '20',
    }),
    createSelectInputField({
      id: 'sort',
      label: 'Sort',
      description: 'Sort events by start time',
      selectOptions: [
        { label: 'Ascending', value: 'asc' },
        { label: 'Descending', value: 'desc' },
      ],
      defaultValue: 'asc',
    }),
  ],
  aiSchema: z.object({
    userUri: z
      .string()
      .min(1)
      .describe(
        'User URI of the Calendly account owner whose events you want to list',
      ),
    startDateTime: z
      .string()
      .nullable()
      .optional()
      .describe('Start time for filtering events (ISO string, optional)'),
    endDateTime: z
      .string()
      .nullable()
      .optional()
      .describe('End time for filtering events (ISO string, optional)'),
    inviteeEmail: z
      .string()
      .nullable()
      .optional()
      .describe('Only return events with this invitee email'),
    status: z.enum(['all', 'active', 'canceled']).optional().default('all'),
    count: z.number().max(50).nullable().optional().default(20),
    sort: z.enum(['asc', 'desc']).optional().default('asc'),
  }),
  run: async ({
    configValue,
    connection,
    workspaceId,
    http,
  }): Promise<Response> => {
    const {
      userUri,
      startDateTime: startDateTimeRaw,
      endDateTime: endDateTimeRaw,
      count,
      inviteeEmail,
      status,
      sort,
    } = configValue;

    const startDateTime = startDateTimeRaw
      ? parseDateToISO(startDateTimeRaw)
      : undefined;
    const endDateTime = endDateTimeRaw
      ? parseDateToISO(endDateTimeRaw)
      : undefined;

    let url = `https://api.calendly.com/scheduled_events`;

    const queryParams: string[] = [];
    if (userUri) {
      queryParams.push(`user=${encodeURIComponent(userUri)}`);
    } else {
      throw new Error('User URI is required to list events');
    }

    if (startDateTime) {
      queryParams.push(`min_start_time=${encodeURIComponent(startDateTime)}`);
    }
    if (endDateTime) {
      queryParams.push(`max_start_time=${encodeURIComponent(endDateTime)}`);
    }
    if (count) {
      queryParams.push(`count=${count}`);
    } else {
      queryParams.push('count=20');
    }

    if (inviteeEmail) {
      queryParams.push(`invitee_email=${encodeURIComponent(inviteeEmail)}`);
    }

    if (status && status !== 'all') {
      queryParams.push(`status=${status}`);
    }

    if (queryParams.length > 0) {
      url += `?${queryParams.join('&')}`;
    }

    if (sort) {
      url += `&sort=start_time:${sort}`;
    } else {
      url += '&sort=start_time:asc';
    }

    const response = await http.request({
      method: 'GET',
      url,
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
      },
      workspaceId,
    });

    return {
      events: response.data.collection,
    };
  },
  mockRun: async (): Promise<Response> => {
    return { events: mock };
  },
});

export default listUserEvents;

const mock = [
  {
    calendar_event: {
      external_id: 'external_id',
      kind: 'google',
    },
    created_at: '2024-10-19T21:14:13.246216Z',
    end_time: '2024-10-21T16:30:00.000000Z',
    event_guests: [] as any,
    event_memberships: [
      {
        buffered_end_time: '2024-10-21T16:30:00.000000Z',
        buffered_start_time: '2024-10-21T16:00:00.000000Z',
        user: 'https://api.calendly.com/users/12345678-1234-1234-1234-123456789012',
        user_email: 'test@test.com',
        user_name: 'Test Name',
      },
    ],
    event_type:
      'https://api.calendly.com/event_types/12345678-1234-1234-1234-12234456789',
    invitees_counter: { active: 1, limit: 1, total: 1 },
    location: {
      join_url:
        'https://calendly.com/events/12345678-1234-1234-1234-12234456789/google_meet',
      status: 'pushed',
      type: 'google_conference',
    },
    meeting_notes_html: '<string>',
    meeting_notes_plain: '<string>',
    name: 'Meeting Name',
    start_time: '2024-10-21T16:00:00.000000Z',
    status: 'active',
    updated_at: '2024-10-19T21:14:15.146391Z',
    uri: 'https://api.calendly.com/scheduled_events/123456-1234-1234',
  },
];

type Response = {
  events: typeof mock;
};

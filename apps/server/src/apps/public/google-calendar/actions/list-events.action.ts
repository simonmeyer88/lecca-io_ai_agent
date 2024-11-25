import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { z } from 'zod';
import { InputConfig } from '@/apps/lib/input-config';
import { GoogleCalendar } from '../google-calendar.app';
import { parseDateToISO } from '@/apps/utils/parse-date-to-iso';

export class ListEvents extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleCalendar;

  id() {
    return 'google-calendar_action_list-events';
  }

  name() {
    return 'List Events';
  }

  description() {
    return 'Lists events from Google Calendar within a specified date range.';
  }

  aiSchema() {
    return z.object({
      calendarId: z.string().nullable().optional().describe('Calendar ID'),
      startDate: z
        .string()
        .describe(
          'Start date must be in ISO String format with timezone or UTC',
        ),
      endDate: z
        .string()
        .describe('End date must be in ISO String format with timezone or UTC'),
      singleEvents: z.enum(['true', 'false']),
      orderBy: z.enum(['startTime', 'updated']),
      maxResults: z.number().min(1).max(20),
    });
  }

  inputConfig(): InputConfig[] {
    return [
      this.app.dynamicSelectCalendar(),
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
    ];
  }

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<any> {
    const googleCalendar = await this.app.googleCalendar({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
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
      singleEvents: singleEvents == 'true',
      orderBy: actualOrderBy,
      maxResults: maxResults,
    });

    if (actualOrderBy === 'updated') {
      // Reverse so the latest updated event is first
      response.data.items = response.data.items.reverse();
    }

    return { events: response.data.items };
  }

  async mockRun(): Promise<any> {
    return {
      events: [this.app.getMockEvent()],
    };
  }
}

type ConfigValue = z.infer<ReturnType<ListEvents['aiSchema']>>;

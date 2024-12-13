import {
  createTimeBasedPollTrigger,
  dateStringToMilliOrNull,
} from '@lecca-io/toolkit';

import { shared } from '../shared/notion.shared';

export const newDatabaseItem = createTimeBasedPollTrigger({
  id: 'notion_trigger_new-database-item',
  name: 'New Database Page',
  description: 'Triggers when a new database page is added.',
  inputConfig: [shared.fields.dynamicSelectDatabase],
  run: async ({ connection, configValue, testing }) => {
    const notionLib = shared.notionLib({
      accessToken: connection.accessToken,
    });

    let cursor;
    let hasMore = true;
    const results = [];

    do {
      const response = await notionLib.databases.query({
        start_cursor: cursor,
        database_id: configValue.databaseId,
        filter: {
          timestamp: 'created_time',
          created_time: {
            //Last 15 minutes
            on_or_after: testing
              ? new Date(Date.now() - 30 * 24 * 60 * 1000).toISOString()
              : new Date(Date.now() - 15 * 60 * 1000).toISOString(),
          },
        },
        page_size: testing ? 1 : undefined,
        sorts: [
          {
            timestamp: 'created_time',
            direction: 'descending',
          },
        ],
      });

      hasMore = response.has_more;
      cursor = response.next_cursor ?? undefined;

      results.push(...response.results);
    } while (hasMore);

    const items = results.map((result) => ({ data: result }));
    return items;
  },
  mockRun: async () => {
    return [
      {
        data: {
          id: 'mock-database-id',
          object: 'page',
          created_time: '2023-10-01T00:00:00.000Z',
          last_edited_time: '2023-10-01T00:00:00.000Z',
        },
      },
    ];
  },
  extractTimestampFromResponse({ response }: { response: any }) {
    return dateStringToMilliOrNull(response.data.created_time);
  },
});

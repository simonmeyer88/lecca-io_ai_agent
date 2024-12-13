import {
  createTimeBasedPollTrigger,
  dateStringToMilliOrNull,
} from '@lecca-io/toolkit';

import { shared } from '../shared/notion.shared';

export const pageUpdated = createTimeBasedPollTrigger({
  id: 'notion_trigger_page-updated',
  name: 'Page Updated',
  description: 'Triggers when any page is updated in the workspace.',
  // No need for database selection since this triggers on any page update.
  inputConfig: [],
  run: async ({ connection, testing }) => {
    const notionLib = shared.notionLib({
      accessToken: connection.accessToken,
    });

    const response = await notionLib.search({
      filter: {
        property: 'object',
        value: 'page',
      },
      sort: {
        timestamp: 'last_edited_time',
        direction: 'descending',
      },
      page_size: testing ? 1 : 15,
    });

    const items = response.results.map((result: any) => {
      return {
        data: result,
      };
    });

    return items;
  },
  mockRun: async () => {
    return [
      {
        data: {
          id: 'mock-page-id',
          object: 'page',
          created_time: '2023-10-01T00:00:00.000Z',
          last_edited_time: '2023-10-02T00:00:00.000Z',
        },
      },
    ];
  },
  extractTimestampFromResponse({ response }: { response: any }) {
    return dateStringToMilliOrNull(response.data.last_edited_time);
  },
});

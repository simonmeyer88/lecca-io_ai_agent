import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/notion.shared';

export const getDatabase = createAction({
  id: 'notion_action_get-database',
  name: 'Get Database',
  description:
    'Fetches a specific database from a Notion workspace using its ID',
  aiSchema: z.object({
    databaseId: z.string(),
  }),
  inputConfig: [shared.fields.dynamicSelectDatabase],
  needsConnection: true,
  run: async ({ connection, configValue }) => {
    const notionLib = shared.notionLib({
      accessToken: connection.accessToken,
    });

    const database = await notionLib.databases.retrieve({
      database_id: configValue.databaseId,
    });

    return {
      database,
    };
  },
  mockRun: async () => {
    return {
      database: {
        id: 'sample-database-id',
        title: 'Sample Database',
        publicUrl: 'https://notion.so/sample-database-id',
        url: 'https://notion.so/sample-database-id',
      },
    };
  },
});

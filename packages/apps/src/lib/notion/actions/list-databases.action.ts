import { createAction } from '@lecca-io/toolkit';
import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { z } from 'zod';

import { shared } from '../shared/notion.shared';

export const listDatabases = createAction({
  id: 'notion_action_list-databases',
  name: 'List Databases',
  description: 'Lists all databases in a Notion workspace',
  inputConfig: [],
  aiSchema: z.object({}),

  run: async ({ connection }) => {
    const notionLib = shared.notionLib({
      accessToken: connection.accessToken,
    });

    const databases = await notionLib.search({
      filter: {
        property: 'object',
        value: 'database',
      },
      sort: {
        direction: 'descending',
        timestamp: 'last_edited_time',
      },
    });

    return {
      databases: databases.results.map((database) => {
        return {
          id: database.id,
          title: (database as DatabaseObjectResponse).title?.[0]?.plain_text,
          publicUrl: (database as DatabaseObjectResponse).public_url,
          url: (database as DatabaseObjectResponse).url,
          archived: (database as DatabaseObjectResponse).archived,
          in_trash: (database as DatabaseObjectResponse).in_trash,
          properties: (database as DatabaseObjectResponse).properties,
        };
      }),
    };
  },

  mockRun: async () => {
    return {
      databases: [
        {
          id: 'database-id',
          title: 'Sample Database',
          publicUrl: 'https://notion.so/database-id',
          url: 'https://notion.so/database-id',
        },
      ],
    };
  },
});

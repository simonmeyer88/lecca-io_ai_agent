import { createAction } from '@lecca-io/toolkit';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { z } from 'zod';

import { shared } from '../shared/notion.shared';

export const updateDatabaseItem = createAction({
  id: 'notion_action_update-database-item',
  name: 'Update Database Page',
  description: 'Updates an existing page in a Notion database',
  needsConnection: true,
  aiSchema: z.object({
    page: z.string().describe('The ID of the page to update.'),
    properties: z.array(
      z.object({
        key: z
          .string()
          .min(1)
          .describe(
            'The name of the property. Must match the name of the property in the database',
          ),
        value: z.string().min(1).describe('The value of the property.'),
      }),
    ),
  }),
  inputConfig: [
    shared.fields.dynamicSelectDatabase,
    shared.fields.dynamicSelectPageInDatabase,
    shared.fields.dynamicSelectPropertiesInPage,
  ],
  run: async ({ connection, configValue }) => {
    const { page, properties } = configValue;

    const notionLib = shared.notionLib({
      accessToken: connection.accessToken,
    });

    const pageRequestToGetDatabaseId = await notionLib.pages.retrieve({
      page_id: page,
    });

    let databaseId: string | undefined;
    if (
      (pageRequestToGetDatabaseId as PageObjectResponse).parent.type ===
      'database_id'
    ) {
      databaseId = (pageRequestToGetDatabaseId as any).parent.database_id;
    } else {
      throw new Error('Page is not part of a database');
    }

    const notionProperties = await shared.buildPropertyMappingsForDatabase({
      notionLib,
      databaseId: databaseId,
      properties: properties as any,
    });

    const updatedItem = await notionLib.pages.update({
      page_id: page,
      properties: notionProperties,
    });

    return updatedItem;
  },
  mockRun: async () => {
    return {
      id: 'mock-page-id',
      object: 'page',
      parent: {
        database_id: 'mock-database-id',
      },
      properties: {
        Name: {
          title: [
            {
              text: {
                content: 'Updated Sample Item',
              },
            },
          ],
        },
      },
    };
  },
});

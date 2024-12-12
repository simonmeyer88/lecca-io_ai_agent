import { createAction } from '@lecca-io/toolkit';
import { createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/notion.shared';

export const addDatabaseItem = createAction({
  id: 'notion_action_add-database-item',
  name: 'Add Database Page',
  description: 'Adds a new page in a Notion database',
  aiSchema: z.object({
    databaseId: z.string(),
    content: z
      .string()
      .nullable()
      .optional()
      .describe('The text content of the page'),
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
    createTextInputField({
      id: 'content',
      label: 'Content',
      placeholder: 'Add text (optional)',
      description: 'The text content of the page',
    }),
    shared.fields.dynamicGetDatabaseProperties,
  ],
  run: async ({ connection, configValue }): Promise<any> => {
    const { databaseId, properties, content } = configValue;

    const notionLib = shared.notionLib({
      accessToken: connection.accessToken,
    });

    const notionProperties = await shared.buildPropertyMappingsForDatabase({
      notionLib,
      databaseId,
      properties: properties as any,
    });

    const children: any[] = [];
    if (content) {
      children.push({
        object: 'block',
        type: 'paragraph',
        paragraph: {
          rich_text: [
            {
              type: 'text',
              text: {
                content: content,
              },
            },
          ],
        },
      });
    }

    const newItem = await notionLib.pages.create({
      parent: { database_id: databaseId },
      properties: notionProperties,
      children,
    });

    return newItem;
  },
  mockRun: async (): Promise<any> => {
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
                content: 'Sample Item',
              },
            },
          ],
        },
      },
    };
  },
});

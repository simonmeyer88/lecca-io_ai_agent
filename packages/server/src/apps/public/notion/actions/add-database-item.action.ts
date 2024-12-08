import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Notion } from '../notion.app';

export class AddDatabaseItem extends Action {
  app: Notion;

  id = 'notion_action_add-database-item';
  name = 'Add Database Page';
  description = 'Adds a new page in a Notion database';
  aiSchema = z.object({
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
  });
  inputConfig: InputConfig[] = [
    this.app.dynamicSelectDatabase(),
    {
      id: 'content',
      label: 'Content',
      placeholder: 'Add text (optional)',
      description: 'The text content of the page',
      inputType: 'text',
    },
    this.app.dynamicGetDatabaseProperties(),
  ];

  async run({
    connection,
    configValue,
  }: RunActionArgs<ConfigValue>): Promise<any> {
    const { databaseId, properties, content } = configValue;

    const notionLib = this.app.notionLib({
      accessToken: connection.accessToken,
    });

    const notionProperties = await this.app.buildPropertyMappingsForDatabase({
      notionLib,
      databaseId,
      properties: properties as any,
    });

    // Add content to page if it exists
    const children: any[] = [];
    if (content)
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

    const newItem = await notionLib.pages.create({
      parent: { database_id: databaseId },
      properties: notionProperties,
      children,
    });

    return newItem;
  }

  async mockRun(): Promise<any> {
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
  }
}

type ConfigValue = z.infer<AddDatabaseItem['aiSchema']>;

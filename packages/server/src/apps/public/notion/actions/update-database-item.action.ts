import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';
import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Notion } from '../notion.app';

export class UpdateDatabaseItem extends Action {
  app: Notion;

  id = 'notion_action_update-database-item';
  name = 'Update Database Page';
  description = 'Updates an existing page in a Notion database';
  aiSchema = z.object({
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
  });
  inputConfig: InputConfig[] = [
    this.app.dynamicSelectDatabase(),
    this.app.dynamicSelectPageInDatabase(),
    this.app.dynamicSelectPropertiesInPage(),
  ];

  async run({
    connection,
    configValue,
  }: RunActionArgs<ConfigValue>): Promise<any> {
    const { page, properties } = configValue;

    const notionLib = this.app.notionLib({
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

    const notionProperties = await this.app.buildPropertyMappingsForDatabase({
      notionLib,
      databaseId: databaseId, // Assuming pageId is used to fetch the properties
      properties: properties as any,
    });

    const updatedItem = await notionLib.pages.update({
      page_id: page,
      properties: notionProperties,
    });

    return updatedItem;
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
                content: 'Updated Sample Item',
              },
            },
          ],
        },
      },
    };
  }
}

type ConfigValue = z.infer<UpdateDatabaseItem['aiSchema']>;

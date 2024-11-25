import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { Notion } from '../notion.app';
import { z } from 'zod';
import { DatabaseObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export class ListDatabases extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Notion;
  id() {
    return 'notion_action_list-databases';
  }
  name() {
    return 'List Databases';
  }
  description() {
    return 'Lists all databases in a Notion workspace';
  }
  aiSchema() {
    return z.object({});
  }
  inputConfig(): InputConfig[] {
    return [];
  }

  async run({ connection }: RunActionArgs<ConfigValue>): Promise<ResponseType> {
    const notionLib = this.app.notionLib({
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
  }

  async mockRun(): Promise<ResponseType> {
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
  }
}

type ResponseType = any;

type ConfigValue = z.infer<ReturnType<ListDatabases['aiSchema']>>;

import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Notion } from '../notion.app';

export class GetDatabase extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Notion;
  id = 'notion_action_get-database';
  name = 'Get Database';
  description =
    'Fetches a specific database from a Notion workspace using its ID';
  aiSchema = z.object({
    databaseId: z.string(),
  });
  inputConfig: InputConfig[] = [this.app.dynamicSelectDatabase()];

  async run({
    connection,
    configValue,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
    const notionLib = this.app.notionLib({
      accessToken: connection.accessToken,
    });

    const databaseId = configValue.databaseId;

    const database = await notionLib.databases.retrieve({
      database_id: databaseId,
    });

    return {
      database,
    };
  }

  async mockRun(): Promise<Response> {
    return {
      database: {
        id: 'sample-database-id',
        title: 'Sample Database',
        publicUrl: 'https://notion.so/sample-database-id',
        url: 'https://notion.so/sample-database-id',
      },
    };
  }
}

type ConfigValue = z.infer<GetDatabase['aiSchema']>;

type Response = any;

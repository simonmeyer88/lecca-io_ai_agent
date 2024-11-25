import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { Notion } from '../notion.app';
import { z } from 'zod';

export class GetDatabase extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Notion;
  id() {
    return 'notion_action_get-database';
  }
  name() {
    return 'Get Database';
  }
  description() {
    return 'Fetches a specific database from a Notion workspace using its ID';
  }
  aiSchema() {
    return z.object({
      databaseId: z.string(),
    });
  }
  inputConfig(): InputConfig[] {
    return [this.app.dynamicSelectDatabase()];
  }

  async run({
    connection,
    configValue,
  }: RunActionArgs<ConfigValue>): Promise<ResponseType> {
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

  async mockRun(): Promise<ResponseType> {
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

type ResponseType = any;

type ConfigValue = z.infer<ReturnType<GetDatabase['aiSchema']>>;

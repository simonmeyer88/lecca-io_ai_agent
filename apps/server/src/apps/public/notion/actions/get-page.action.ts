import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { Notion } from '../notion.app';
import { z } from 'zod';

export class GetPage extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Notion;

  id() {
    return 'notion_action_get-page';
  }

  name() {
    return 'Get Page Contents';
  }

  description() {
    return "Fetches a page's contents";
  }

  aiSchema() {
    return z.object({
      pageId: z.string().min(1).describe('The ID of the page to retrieve.'),
    });
  }

  inputConfig(): InputConfig[] {
    return [this.app.dynamicSelectPage()];
  }

  async run({
    connection,
    configValue,
  }: RunActionArgs<ConfigValue>): Promise<any> {
    const { pageId } = configValue;

    const notionLib = this.app.notionLib({
      accessToken: connection.accessToken,
    });

    // Fetch page metadata
    const page = await notionLib.pages.retrieve({ page_id: pageId });

    // Fetch page content (blocks)
    const blockChildren = await notionLib.blocks.children.list({
      block_id: pageId,
    });

    return {
      page,
      content: blockChildren.results,
    };
  }

  async mockRun(): Promise<any> {
    return {
      page: {
        object: 'page',
        id: 'mock-page-id',
        created_time: '2023-08-01T00:00:00.000Z',
        last_edited_time: '2023-08-01T12:34:56.000Z',
        parent: {
          type: 'database_id',
          database_id: 'mock-database-id',
        },
        archived: false,
        properties: {},
      },
      content: [
        {
          object: 'block',
          id: 'mock-block-id',
          type: 'paragraph',
          paragraph: {
            text: [
              {
                type: 'text',
                text: {
                  content: 'This is a mock paragraph block.',
                },
              },
            ],
          },
        },
      ],
    };
  }
}

type ConfigValue = z.infer<ReturnType<GetPage['aiSchema']>>;

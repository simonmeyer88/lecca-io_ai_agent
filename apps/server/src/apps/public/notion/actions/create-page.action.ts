import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Notion } from '../notion.app';

export class CreatePage extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Notion;
  id() {
    return 'notion_action_create-page';
  }
  name() {
    return 'Create Page';
  }
  description() {
    return 'Creates a new page in Notion.';
  }
  aiSchema() {
    return z.object({
      page: z.string().min(1).describe('The ID of the parent page'),
      title: z.string().min(1).describe('The title of the new page'),
      content: z.string().min(1).describe('The content of the new page'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        ...this.app.dynamicSelectPage(),
        label: 'Parent Page',
        description: 'Select the parent page for the new page.',
      },
      {
        id: 'title',
        label: 'Title',
        description: 'Title of the new page',
        inputType: 'text',
        placeholder: 'Add a title',
        required: {
          missingMessage: 'Title is required',
          missingStatus: 'warning',
        },
      },
      {
        id: 'content',
        label: 'Content',
        description: 'The content of the new page.',
        inputType: 'text',
        placeholder: 'Enter content',
        required: {
          missingMessage: 'Content is required',
          missingStatus: 'warning',
        },
      },
    ];
  }

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<unknown> {
    const notionLib = this.app.notionLib({
      accessToken: connection.accessToken,
    });

    const response = await notionLib.pages.create({
      parent: {
        page_id: configValue.page,
      },
      properties: {
        title: [
          {
            text: {
              content: configValue.title,
            },
          },
        ],
      },
      children: [
        {
          object: 'block',
          type: 'paragraph',
          paragraph: {
            rich_text: [
              {
                type: 'text',
                text: {
                  content: configValue.content,
                },
              },
            ],
          },
        },
      ],
    });

    return response;
  }

  async mockRun(): Promise<unknown> {
    return {
      object: 'page',
      id: 'page-id',
      created_time: '2024-06-15T21:19:00.000Z',
      last_edited_time: '2024-06-15T21:19:00.000Z',
      created_by: {
        object: 'user',
        id: 'user-id',
      },
      last_edited_by: {
        object: 'user',
        id: 'user-id',
      },
      cover: null,
      icon: null,
      parent: {
        type: 'page_id',
        page_id: 'parent-page-id',
      },
      archived: false,
      in_trash: false,
      properties: {
        title: {
          id: 'title',
          type: 'title',
          title: [
            {
              type: 'text',
              text: {
                content: 'New Title',
                link: null,
              },
              annotations: {
                bold: false,
                italic: false,
                strikethrough: false,
                underline: false,
                code: false,
                color: 'default',
              },
              plain_text: 'New Title',
              href: null,
            },
          ],
        },
      },
      url: 'https://www.notion.so/page-id',
      public_url: null,
      request_id: 'request-id',
    };
  }
}

type ConfigValue = z.infer<ReturnType<CreatePage['aiSchema']>>;

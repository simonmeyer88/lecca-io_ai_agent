import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/notion.shared';

export const createPage = createAction({
  id: 'notion_action_create-page',
  name: 'Create Page',
  description: 'Creates a new page in Notion.',
  aiSchema: z.object({
    page: z.string().describe('The ID of the parent page'),
    title: z.string().describe('The title of the new page'),
    content: z.string().describe('The content of the new page'),
  }),
  inputConfig: [
    shared.fields.dynamicSelectPage,
    createTextInputField({
      id: 'title',
      label: 'Title',
      description: 'Title of the new page',
      placeholder: 'Add a title',
      required: {
        missingMessage: 'Title is required',
        missingStatus: 'warning',
      },
    }),
    createTextInputField({
      id: 'content',
      label: 'Content',
      description: 'The content of the new page.',
      placeholder: 'Enter content',
      required: {
        missingMessage: 'Content is required',
        missingStatus: 'warning',
      },
    }),
  ],
  run: async ({ configValue, connection }) => {
    const notionLib = shared.notionLib({
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
  },
  mockRun: async () => {
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
  },
});

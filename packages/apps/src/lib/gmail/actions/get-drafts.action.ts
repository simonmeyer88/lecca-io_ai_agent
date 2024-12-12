import { createAction, parseNumberOrThrow } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/gmail.shared';

export const getDrafts = createAction({
  id: 'gmail_action_get-drafts',
  name: 'Get Drafts',
  description: 'Get a list of drafts',
  aiSchema: z.object({
    labelIds: z
      .array(z.string())
      .nullable()
      .optional()
      .describe('The IDs of the labels to filter messages'),
    includeSpamTrash: z
      .boolean()
      .nullable()
      .optional()
      .describe('Include messages from SPAM and TRASH in the results'),
    maxResults: z
      .number()
      .nullable()
      .optional()
      .describe('The maximum number of messages to return'),
    pageToken: z
      .string()
      .nullable()
      .optional()
      .describe('Used to retrieve the next page of results'),
  }),
  inputConfig: [
    {
      label: 'Labels',
      id: 'labelIds',
      inputType: 'dynamic-multi-select',
      placeholder: 'Add labels',
      description: 'The IDs of the labels to filter emails',
      defaultValue: ['UNREAD', 'INBOX'],
      _getDynamicValues: async ({ connection }) => {
        const gmail = shared.gmail({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        const labels = await gmail.users.labels.list({
          userId: 'me',
        });

        return (
          labels?.data?.labels?.map((label) => ({
            label: label.name,
            value: label.id,
          })) ?? []
        );
      },
    },
    {
      label: 'Max Results',
      id: 'maxResults',
      inputType: 'number',
      defaultValue: '10',
      placeholder: 'Add max results',
      description: 'The maximum number of messages to return',
    },
    {
      label: 'Page Token',
      id: 'pageToken',
      inputType: 'text',
      placeholder: 'Add page token',
      description: 'Used to retrieve the next page of results',
    },
  ],
  run: async ({ configValue, connection }) => {
    const gmail = shared.gmail({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const response = await gmail.users.drafts.list({
      userId: 'me',
      includeSpamTrash: configValue.includeSpamTrash,
      maxResults: parseNumberOrThrow({
        value: configValue.maxResults,
        propertyName: 'Max results',
      }),
      pageToken: configValue.pageToken,
    });

    const messages = await Promise.all(
      response.data.drafts?.map(async (draft) => {
        const messageResponse = await gmail.users.drafts.get({
          userId: 'me',
          id: draft.id,
        });

        return shared.parseDraft(messageResponse);
      }) ?? [],
    );

    return messages;
  },
  mockRun: async () => {
    return [shared.mockDraft];
  },
});

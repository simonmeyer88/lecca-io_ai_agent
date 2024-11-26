import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { parseNumberOrThrow } from '@/apps/utils/parse-number-or-throw';

import { Gmail } from '../gmail.app';

export class GetDrafts extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Gmail;
  id() {
    return 'gmail_action_get-drafts';
  }
  name() {
    return 'Get Drafts';
  }
  description() {
    return 'Get a list of drafts';
  }
  aiSchema() {
    return z.object({
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
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        label: 'Labels',
        id: 'labelIds',
        inputType: 'dynamic-multi-select',
        placeholder: 'Add labels',
        description: 'The IDs of the labels to filter emails',
        defaultValue: ['UNREAD', 'INBOX'],
        _getDynamicValues: async ({ connection }) => {
          const gmail = await this.app.gmail({
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
    ];
  }

  async run({ configValue, connection }: RunActionArgs<ConfigValue>) {
    const gmail = await (this.app as Gmail).gmail({
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

        return this.app.parseDraft(messageResponse);
      }) ?? [],
    );

    return messages;
  }

  async mockRun() {
    return [this.app.mockDraft];
  }
}

type ConfigValue = z.infer<ReturnType<GetDrafts['aiSchema']>>;

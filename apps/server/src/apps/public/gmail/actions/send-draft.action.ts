import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Gmail } from '../gmail.app';

export class SendDraft extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Gmail;
  id = 'gmail_action_send-draft';
  name = 'Send Draft';
  description = 'Send a email draft';
  aiSchema = z.object({
    draftId: z.string().min(1).describe('The ID of the draft to send'),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'draftId',
      label: 'Draft',
      inputType: 'dynamic-select',
      placeholder: 'Select draft',
      description: 'The draft to send',
      _getDynamicValues: async ({ connection }) => {
        const gmail = await (this.app as Gmail).gmail({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        const response = await gmail.users.drafts.list({
          userId: 'me',
        });

        const messages = await Promise.all(
          response.data.drafts.map(async (draft) => {
            const messageResponse = await gmail.users.drafts.get({
              userId: 'me',
              id: draft.id,
            });

            let subject = messageResponse.data.message.payload.headers.find(
              (header) => header.name === 'Subject',
            )?.value;

            if (!subject || subject === '') {
              subject = 'No Subject';
            }

            return {
              label: subject,
              value: draft.id,
            };
          }),
        );

        return messages;
      },
      required: {
        missingMessage: 'Draft ID is required',
        missingStatus: 'warning',
      },
    },
  ];

  async run({ configValue, connection }: RunActionArgs<ConfigValue>) {
    const gmail = await this.app.gmail({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const draftSendResponse = await gmail.users.drafts.send({
      userId: 'me',
      requestBody: {
        id: configValue.draftId,
      },
    });

    const messageResponse = await gmail.users.messages.get({
      userId: 'me',
      id: draftSendResponse.data.id,
    });

    return this.app.parseEmail(messageResponse, {
      htmlOrText: 'both',
    });
  }

  async mockRun() {
    return this.app.mockDraft;
  }
}

type ConfigValue = z.infer<SendDraft['aiSchema']>;

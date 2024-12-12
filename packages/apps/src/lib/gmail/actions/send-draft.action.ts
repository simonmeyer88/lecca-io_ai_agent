import { createAction, createDynamicSelectInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/gmail.shared';

export const sendDraft = createAction({
  id: 'gmail_action_send-draft',
  name: 'Send Draft',
  description: 'Send a email draft',
  inputConfig: [
    createDynamicSelectInputField({
      id: 'draftId',
      label: 'Draft',
      placeholder: 'Select draft',
      description: 'The draft to send',
      _getDynamicValues: async ({ connection }) => {
        const gmail = shared.gmail({
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
    }),
  ],
  aiSchema: z.object({
    draftId: z.string().min(1).describe('The ID of the draft to send'),
  }),
  run: async ({ configValue, connection }) => {
    const gmail = shared.gmail({
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

    return shared.parseEmail(messageResponse, {
      htmlOrText: 'both',
    });
  },
  mockRun: async () => {
    return shared.mockDraft;
  },
});

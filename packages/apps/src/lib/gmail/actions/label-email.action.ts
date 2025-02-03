import {
  createAction,
  createDynamicMultiSelectInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/gmail.shared';

export const labelEmail = createAction({
  id: 'gmail_action_label-email',
  name: 'Label Email',
  description: 'Apply labels to a specific email in Gmail',
  inputConfig: [
    createTextInputField({
      id: 'messageId',
      label: 'Message ID',
      description: 'The message ID of the email to label.',
      required: {
        missingMessage: 'Message ID is required',
        missingStatus: 'warning',
      },
    }),
    createDynamicMultiSelectInputField({
      id: 'labelId',
      label: 'Labels',
      description: 'Select the label(s) to apply to the email',
      _getDynamicValues: async ({ connection }) => {
        const gmail = shared.gmail({
          accessToken: connection!.accessToken,
          refreshToken: connection!.refreshToken,
        });

        const labels = await gmail.users.labels.list({
          userId: 'me',
        });

        return labels.data.labels!.map((label) => ({
          label: label.name!,
          value: label.id!,
        }));
      },
    }),
  ],
  aiSchema: z.object({
    messageId: z
      .string()
      .describe(
        "The ID of the message (email) to label. If you don't have it, ask for it or retrieve it.",
      ),
    labelId: z
      .string()
      .describe(
        "The ID of the gmail label to apply. If you don't have it, ask for it or retrieve it.",
      ),
  }),
  run: async ({ configValue, connection }) => {
    const gmail = shared.gmail({
      accessToken: connection!.accessToken,
      refreshToken: connection!.refreshToken,
    });

    const { messageId, labelId } = configValue;

    await gmail.users.messages.modify({
      userId: 'me',
      id: messageId,
      requestBody: {
        addLabelIds: [labelId],
      },
    });

    return { success: true };
  },
  mockRun: async () => {
    return { success: true };
  },
});

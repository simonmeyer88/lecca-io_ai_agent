import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Gmail } from '../gmail.app';

export class LabelEmail extends Action {
  app: Gmail;
  id = 'gmail_action_label-email';
  name = 'Label Email';
  description = 'Apply labels to a specific email in Gmail';
  aiSchema = z.object({
    messageId: z
      .string()
      .min(1)
      .describe(
        "The ID of the message (email) to label. If you don't have it, ask for it or retrieve it.",
      ),
    labelId: z
      .string()
      .min(1)
      .describe(
        "The ID of the gmail label to apply. If you don't have it, ask for it or retrieve it.",
      ),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'messageId',
      label: 'Message ID',
      inputType: 'text',
      description: 'The message ID of the email to label.',
      required: {
        missingMessage: 'Message ID is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'labelId',
      label: 'Labels',
      description: 'Select the label(s) to apply to the email',
      inputType: 'dynamic-multi-select',
      _getDynamicValues: async ({ connection }) => {
        const gmail = await (this.app as Gmail).gmail({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        const labels = await gmail.users.labels.list({
          userId: 'me',
        });

        return labels.data.labels.map((label) => ({
          label: label.name,
          value: label.id,
        }));
      },
    },
  ];

  async run({ configValue, connection }: RunActionArgs<ConfigValue>) {
    const gmail = await (this.app as Gmail).gmail({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
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
  }

  async mockRun() {
    return { success: true };
  }
}

type ConfigValue = z.infer<LabelEmail['aiSchema']>;

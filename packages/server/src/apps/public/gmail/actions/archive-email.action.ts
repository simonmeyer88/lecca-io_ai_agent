import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Gmail } from '../gmail.app';

export class ArchiveEmail extends Action {
  app: Gmail;
  id = 'gmail_action_archive-email';
  name = 'Archive Email';
  description = 'Archive an email in Gmail';
  aiSchema = z.object({
    messageId: z.string().min(1).describe('The ID of the email to archive'),
  });
  inputConfig: InputConfig[] = [
    {
      label: 'Message ID',
      id: 'messageId',
      inputType: 'text',
      placeholder: 'Add message ID',
      description: 'The ID of the email to archive',
      required: {
        missingMessage: 'Message ID is required',
        missingStatus: 'warning',
      },
    },
  ];

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<boolean> {
    const gmail = await this.app.gmail({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    // Remove the 'INBOX' label to archive the email
    await gmail.users.messages.modify({
      userId: 'me',
      id: configValue.messageId,
      requestBody: {
        removeLabelIds: ['INBOX'],
      },
    });

    return true;
  }

  async mockRun(): Promise<boolean> {
    return true;
  }
}

type ConfigValue = z.infer<ArchiveEmail['aiSchema']>;

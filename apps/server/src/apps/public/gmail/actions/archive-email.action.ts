import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { Gmail } from '../gmail.app';
import { z } from 'zod';

export class ArchiveEmail extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Gmail;
  id() {
    return 'gmail_action_archive-email';
  }
  name() {
    return 'Archive Email';
  }
  description() {
    return 'Archive an email in Gmail';
  }
  aiSchema() {
    return z.object({
      messageId: z.string().min(1).describe('The ID of the email to archive'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
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
  }

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

type ConfigValue = z.infer<ReturnType<ArchiveEmail['aiSchema']>>;

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { Gmail } from '../gmail.app';
import { z } from 'zod';

export class GetLabels extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Gmail;
  id() {
    return 'gmail_action_get-labels';
  }
  name() {
    return 'Get Labels';
  }
  description() {
    return 'Get labels from gmail';
  }
  aiSchema() {
    return z.object({});
  }
  inputConfig(): InputConfig[] {
    return [];
  }

  async run({ connection }: RunActionArgs<ConfigValue>) {
    const gmail = await (this.app as Gmail).gmail({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const labels = await gmail.users.labels.list({
      userId: 'me',
    });

    return labels.data.labels;
  }

  async mockRun() {
    return [
      {
        id: 'CHAT',
        labelListVisibility: 'labelHide',
        messageListVisibility: 'hide',
        name: 'CHAT',
        type: 'system',
      },
      {
        id: 'SENT',
        name: 'SENT',
        type: 'system',
      },
      {
        id: 'INBOX',
        labelListVisibility: 'labelShow',
        messageListVisibility: 'hide',
        name: 'INBOX',
        type: 'system',
      },
    ];
  }
}

type ConfigValue = null;

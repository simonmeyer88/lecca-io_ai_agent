import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Gmail } from '../gmail.app';

export class GetLabels extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Gmail;
  id = 'gmail_action_get-labels';
  name = 'Get Labels';
  description = 'Get labels from gmail';
  aiSchema = z.object({});
  inputConfig: InputConfig[] = [];

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

type ConfigValue = z.infer<GetLabels['aiSchema']>;

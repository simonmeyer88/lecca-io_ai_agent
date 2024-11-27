import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Gmail } from '../gmail.app';

export class DeleteDraft extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Gmail;

  id = 'gmail_action_delete-draft';
  name = 'Delete Draft';
  description = 'Delete a draft email in Gmail';
  aiSchema = z.object({
    draftId: z.string().nonempty().describe('The ID of the draft to delete'),
  });
  inputConfig: InputConfig[] = [
    {
      label: 'Draft ID',
      id: 'draftId',
      inputType: 'text',
      placeholder: 'Enter the draft ID',
      description: 'The unique ID of the draft you want to delete.',
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

    await gmail.users.drafts.delete({
      userId: 'me',
      id: configValue.draftId,
    });

    return { success: true, message: 'Draft deleted successfully.' };
  }

  async mockRun() {
    return { success: true, message: 'Mock draft deletion successful.' };
  }
}

type ConfigValue = z.infer<DeleteDraft['aiSchema']>;

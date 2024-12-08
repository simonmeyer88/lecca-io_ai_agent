import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { MicrosoftOutlook } from '../microsoft-outlook.app';

export class SendDraft extends Action {
  app: MicrosoftOutlook;
  id = 'microsoft-outlook_action_send-draft';
  name = 'Send Draft';
  description = 'Send a draft from Outlook';
  aiSchema = z.object({
    draftId: z.string().min(1).describe('The ID of the draft to send'),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'draftId',
      label: 'Draft',
      description: 'The draft to send',
      inputType: 'dynamic-select',
      _getDynamicValues: async ({ connection, workspaceId }) => {
        const url =
          'https://graph.microsoft.com/v1.0/me/mailFolders/drafts/messages';

        const drafts = await this.app.http.loggedRequest({
          method: 'GET',
          url,
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
          },
          workspaceId,
        });

        return drafts.data.value.map((draft: any) => ({
          label: !draft.subject ? 'No Subject' : draft.subject,
          value: draft.id,
        }));
      },
    },
  ];

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<unknown> {
    const url = `https://graph.microsoft.com/v1.0/me/messages/${configValue.draftId}/send`;

    const sendDraftResult = await this.app.http.loggedRequest({
      method: 'POST',
      url,
      data: {},
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
      },
      workspaceId,
    });

    return sendDraftResult.data;
  }

  async mockRun(): Promise<unknown> {
    return {};
  }
}

type ConfigValue = z.infer<SendDraft['aiSchema']>;

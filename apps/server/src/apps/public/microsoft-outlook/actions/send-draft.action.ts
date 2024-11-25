import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { MicrosoftOutlook } from '../microsoft-outlook.app';
import { z } from 'zod';

export class SendDraft extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: MicrosoftOutlook;
  id() {
    return 'microsoft-outlook_action_send-draft';
  }
  name() {
    return 'Send Draft';
  }
  description() {
    return 'Send a draft from Outlook';
  }
  aiSchema() {
    return z.object({
      draftId: z.string().min(1).describe('The ID of the draft to send'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
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
  }

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

type ConfigValue = z.infer<ReturnType<SendDraft['aiSchema']>>;

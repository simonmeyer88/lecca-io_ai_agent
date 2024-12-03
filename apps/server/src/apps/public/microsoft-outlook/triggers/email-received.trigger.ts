import { InputConfig } from '@/apps/lib/input-config';
import { RunTriggerArgs, TimeBasedPollTrigger } from '@/apps/lib/trigger';
import { DateStringToMilliOrNull } from '@/apps/utils/date-string-to-milli-or-null';

import { MicrosoftOutlook } from '../microsoft-outlook.app';

export class EmailReceived extends TimeBasedPollTrigger {
  app: MicrosoftOutlook;
  id = 'microsoft-outlook_trigger_email-received';
  name = 'Email Received';
  description = 'Triggers when a new email is received';
  inputConfig: InputConfig[] = [
    {
      label: 'Labels',
      id: 'labelIds',
      inputType: 'dynamic-multi-select',
      placeholder: 'Add labels',
      description: 'The IDs of the labels to filter emails',
      defaultValue: ['In'],
      _getDynamicValues: async ({ connection, workspaceId }) => {
        const url = 'https://graph.microsoft.com/v1.0/me/mailFolders';
        const labels = await this.app.http.loggedRequest({
          method: 'GET',
          url,
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
          },
          workspaceId,
        });

        return labels.data.value.map((label: any) => ({
          label: label.displayName,
          value: label.id,
        }));
      },
    },
  ];

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunTriggerArgs<ConfigValue>): Promise<(typeof mock)[]> {
    const url = `https://graph.microsoft.com/v1.0/me/messages?$top=5&$filter=${configValue.labelIds
      .map((labelId) => `containsAny(parentFolderId, '${labelId}')`)
      .join(' or ')}`;

    const messages = await this.app.http.loggedRequest({
      method: 'GET',
      url,
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
      },
      workspaceId,
    });

    return messages.data.value?.map?.((message: typeof mock) => message);
  }

  async mockRun(): Promise<(typeof mock)[]> {
    return [mock];
  }

  extractTimestampFromResponse({ response }: { response: typeof mock }) {
    //return timestamp from response.createdDateTime
    return DateStringToMilliOrNull(response.createdDateTime);
  }
}

const mock = {
  id: 'email-id',
  createdDateTime: '2024-06-21T15:58:42Z',
  lastModifiedDateTime: '2024-06-21T15:58:42Z',
  changeKey: 'change-key',
  categories: [] as any,
  receivedDateTime: '2024-06-21T15:58:42Z',
  sentDateTime: '2024-06-21T15:58:42Z',
  hasAttachments: false,
  internetMessageId: '<some-id@MN2PR03MB4976.namprd03.prod.outlook.com>',
  subject: 'Testing',
  bodyPreview: 'testing',
  importance: 'normal',
  parentFolderId: 'parent-folder-id',
  conversationId: 'conversation-id',
  conversationIndex: 'conversation-index',
  isDeliveryReceiptRequested: false,
  isReadReceiptRequested: false,
  isRead: true,
  isDraft: true,
  webLink: 'https://outlook.live.com/owa/?ItemID=some-id',
  inferenceClassification: 'focused',
  body: {
    contentType: 'text',
    content: 'testing',
  },
  toRecipients: [
    {
      emailAddress: {
        name: 'test@gmail.com',
        address: 'test@gmail.com',
      },
    },
  ],
  ccRecipients: [] as any,
  bccRecipients: [] as any,
  replyTo: [] as any,
  flag: {
    flagStatus: 'notFlagged',
  },
};

type ConfigValue = {
  labelIds: string[];
};

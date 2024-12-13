import {
  createTimeBasedPollTrigger,
  dateStringToMilliOrNull,
} from '@lecca-io/toolkit';

export const emailReceived = createTimeBasedPollTrigger({
  id: 'microsoft-outlook_trigger_email-received',
  name: 'Email Received',
  description: 'Triggers when a new email is received',
  inputConfig: [
    {
      label: 'Labels',
      id: 'labelIds',
      inputType: 'dynamic-multi-select',
      placeholder: 'Add labels',
      description: 'The IDs of the labels to filter emails',
      defaultValue: ['In'],
      _getDynamicValues: async ({ connection, workspaceId, http }) => {
        const url = 'https://graph.microsoft.com/v1.0/me/mailFolders';
        const labels = await http.request({
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
  ],
  run: async ({ configValue, connection, workspaceId, http }) => {
    const url = `https://graph.microsoft.com/v1.0/me/messages?$top=5&$filter=${configValue.labelIds
      .map((labelId) => `containsAny(parentFolderId, '${labelId}')`)
      .join(' or ')}`;

    const messages = await http.request({
      method: 'GET',
      url,
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
      },
      workspaceId,
    });

    return messages.data.value?.map?.((message: typeof mock) => message);
  },
  mockRun: async () => {
    return [mock];
  },
  extractTimestampFromResponse({ response }: { response: typeof mock }) {
    //return timestamp from response.createdDateTime
    return dateStringToMilliOrNull(response.createdDateTime);
  },
});

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

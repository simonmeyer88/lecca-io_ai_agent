import {
  createCustomWebhookTrigger,
  createSelectInputField,
} from '@lecca-io/toolkit';

export const listenForWebhook = createCustomWebhookTrigger({
  id: 'flow-control_trigger_listen-for-webhook',
  name: 'Listen for Webhook',
  description:
    'Listen for a POST, PUT, or GET request to a custom webhook URL.',
  needsConnection: false,
  iconUrl: `https://lecca-io.s3.us-east-2.amazonaws.com/assets/triggers/flow-control_trigger_listen-for-webhook.svg`,
  availableForAgent: false,
  inputConfig: [
    {
      id: 'webhookUrl',
      inputType: 'dynamic-workflow-webhook-url',
      label: 'Unique Webhook URL',
      description: 'A unique webhook URL for this specific workflow.',
      _getDynamicValues: async ({ workflowId }) => {
        if (workflowId) {
          return [
            {
              value: `${process.env.SERVER_URL}/webhooks/workflows/${workflowId}`,
              label: `Unique Webhook Url`,
            },
          ];
        }
        return [];
      },
    },
    createSelectInputField({
      id: 'method',
      label: 'HTTP Method',
      description: 'The HTTP method that the webhook should listen for.',
      hideCustomTab: true,
      selectOptions: [
        { label: 'POST', value: 'POST' },
        { label: 'PUT', value: 'PUT' },
        { label: 'GET', value: 'GET' },
      ],
      defaultValue: 'POST',
      required: {
        missingMessage: 'Please select an HTTP method.',
        missingStatus: 'warning',
      },
    }),
  ],
  run: async ({ inputData }) => {
    return [inputData];
  },
  mockRun: async () => ['Mocking not available'],
});

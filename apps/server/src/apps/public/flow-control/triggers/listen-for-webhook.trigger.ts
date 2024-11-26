import { InputConfig } from '@/apps/lib/input-config';
import {
  CustomWebhookTrigger,
  RunTriggerArgs,
  TriggerConstructorArgs,
} from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { FlowControl } from '../flow-control.app';

export class ListenForWebhook extends CustomWebhookTrigger {
  constructor(args: TriggerConstructorArgs) {
    super(args);
  }

  app: FlowControl;
  id() {
    return 'flow-control_trigger_listen-for-webhook';
  }
  name() {
    return 'Listen for Webhook';
  }
  iconUrl(): null | string {
    return `${ServerConfig.INTEGRATION_ICON_BASE_URL}/triggers/${this.id()}.svg`;
  }
  availableForAgent(): boolean {
    return false;
  }
  description() {
    return 'Listen for a POST, PUT, or GET request to a custom webhook URL.';
  }
  needsConnection(): boolean {
    return false;
  }
  inputConfig(): InputConfig[] {
    return [
      {
        id: 'webhookUrl',
        inputType: 'dynamic-workflow-webhook-url',
        label: 'Unique Webhook URL',
        description: 'A unique webhook URL for this specific workflow.',
        _getDynamicValues: async ({ workflowId }) => {
          if (workflowId) {
            return [
              {
                value: `${ServerConfig.SERVER_URL}/webhooks/workflows/${workflowId}`,
                label: `Unique Webhook Url`,
              },
            ];
          } else {
            return [];
          }
        },
      },
      {
        id: 'method',
        inputType: 'select',
        label: 'HTTP Method',
        description: 'The HTTP method that the webhook should listen for.',
        hideCustomTab: true,
        selectOptions: [
          {
            label: 'POST',
            value: 'POST',
          },
          {
            label: 'PUT',
            value: 'PUT',
          },
          {
            label: 'GET',
            value: 'GET',
          },
        ],
        defaultValue: 'POST',
        required: {
          missingMessage: 'Please select an HTTP method.',
          missingStatus: 'warning',
        },
      },
    ];
  }

  async run({ inputData }: RunTriggerArgs<ConfigValue, unknown>) {
    return [inputData];
  }

  async mockRun() {
    //The ui doesn't let mocking for webhooks so this isn't needed
    return ['Mocking not available'];
  }
}

type ConfigValue = {
  userId: string;
  channelId: string;
};

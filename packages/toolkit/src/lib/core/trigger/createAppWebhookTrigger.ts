import { InputConfig } from '../../types/input-config.types';
import { RunTriggerArgs } from '../../types/trigger.types';
import { ViewOptions } from '../../types/view-options.types';

export function createAppWebhookTrigger<
  ConfigValue extends Record<string, any> = Record<string, any>,
  ResponseItem = any,
  InputData = unknown,
>(args: CreateAppWebhookTriggerArgs<ConfigValue, ResponseItem, InputData>) {
  return {
    ...args,
    strategy: 'webhook.app',
  };
}

export type CreateAppWebhookTriggerArgs<
  ConfigValue extends Record<string, any>,
  ResponseItem,
  InputData,
> = {
  id: string;
  name: string;
  description: string;
  inputConfig: InputConfig;
  needsConnection: boolean;
  iconUrl?: string;
  viewOptions?: ViewOptions;
  availableForAgent?: boolean;
  run: (
    args: RunTriggerArgs<ConfigValue, InputData>,
  ) => Promise<ResponseItem[]>;
  mockRun: (
    args: RunTriggerArgs<ConfigValue, InputData>,
  ) => Promise<ResponseItem[]>;
  eventType: string;
  webhookPayloadMatchesIdentifier: (
    args: WebhookPayloadMatchesIdentifierArgs<InputData>,
  ) => boolean;
};

export type WebhookPayloadMatchesIdentifierArgs<InputData> = {
  webhookBody: InputData;
  connectionMetadata: unknown;
};

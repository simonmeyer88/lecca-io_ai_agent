import { InputConfig } from '../../types/input-config.types';
import { RunTriggerArgs } from '../../types/trigger.types';
import { ViewOptions } from '../../types/view-options.types';

export function createCustomWebhookTrigger<
  ConfigValue extends Record<string, any> = Record<string, any>,
  ResponseItem = any,
>(args: CreateCustomWebhookTriggerArgs<ConfigValue, ResponseItem>) {
  return {
    ...args,
    strategy: 'webhook.custom',
  };
}

export type CreateCustomWebhookTriggerArgs<
  ConfigValue extends Record<string, any>,
  ResponseItem,
> = {
  id: string;
  name: string;
  description: string;
  inputConfig: InputConfig;
  needsConnection?: boolean;
  iconUrl?: string;
  viewOptions?: ViewOptions;
  availableForAgent?: boolean;
  run: (args: RunTriggerArgs<ConfigValue>) => Promise<ResponseItem[]>;
  mockRun: (args: RunTriggerArgs<ConfigValue>) => Promise<ResponseItem[]>;
};

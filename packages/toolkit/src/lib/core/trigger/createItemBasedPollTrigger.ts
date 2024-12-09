import { InputConfig } from '../../types/input-config.types';
import { RunTriggerArgs } from '../../types/trigger.types';
import { ViewOptions } from '../../types/view-options.types';

export function createItemBasedPollTrigger<
  ConfigValue extends Record<string, any> = Record<string, any>,
  ResponseItem = any,
>(args: CreateItemBasedPollTriggerArgs<ConfigValue, ResponseItem>) {
  return {
    ...args,
    strategy: 'poll.dedupe-item-based',
  };
}

export type CreateItemBasedPollTriggerArgs<
  ConfigValue extends Record<string, any>,
  ResponseItem,
> = {
  id: string;
  name: string;
  description: string;
  inputConfig: InputConfig;
  iconUrl?: string;
  needsConnection?: boolean;
  viewOptions?: ViewOptions;
  run: (args: RunTriggerArgs<ConfigValue>) => Promise<ResponseItem[]>;
  mockRun: (args: RunTriggerArgs<ConfigValue>) => Promise<ResponseItem[]>;
  extractItemIdentifierFromResponse: (args: {
    response: ResponseItem;
  }) => string | number;
};

import { InputConfig } from '../../types/input-config.types';
import { RunTriggerArgs } from '../../types/trigger.types';
import { ViewOptions } from '../../types/view-options.types';

export function createTimeBasedPollTrigger<
  ConfigValue extends Record<string, any> = Record<string, any>,
  ResponseItem = any,
>(args: CreateTimeBasedPollTriggerArgs<ConfigValue, ResponseItem>) {
  return {
    ...args,
    strategy: 'poll.dedupe-time-based',
  };
}

export type CreateTimeBasedPollTriggerArgs<
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
  extractTimestampFromResponse: (args: { response: ResponseItem }) => number;
};

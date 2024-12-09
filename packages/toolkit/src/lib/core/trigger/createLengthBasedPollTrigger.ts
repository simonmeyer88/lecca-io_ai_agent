import { InputConfig } from '../../types/input-config.types';
import { RunTriggerArgs } from '../../types/trigger.types';
import { ViewOptions } from '../../types/view-options.types';

export function createLengthBasedPollTrigger<
  ConfigValue extends Record<string, any> = Record<string, any>,
  ResponseItem = any,
>(args: CreateLengthBasedPollTriggerArgs<ConfigValue, ResponseItem>) {
  return {
    ...args,
    strategy: 'poll.dedupe-length-based',
  };
}

export type CreateLengthBasedPollTriggerArgs<
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
};

import { z } from 'zod';

import { RunActionArgs } from '../../types/action.types';
import { InputConfig } from '../../types/input-config.types';
import { ViewOptions } from '../../types/view-options.types';

export function createAction<T extends z.ZodObject<any, any>>(
  args: CreateActionArgs<T>,
) {
  return args;
}

export type CreateActionArgs<T extends z.ZodObject<any, any>> = {
  id: string;
  name: string;
  description: string;
  inputConfig: InputConfig;
  aiSchema: T;
  needsConnection?: boolean;
  viewOptions?: ViewOptions;
  run: (args: RunActionArgs<z.infer<T>>) => Promise<any>;
  mockRun: (args: RunActionArgs<z.infer<T>>) => Promise<any>;
  iconUrl?: string;
  availableForAgent?: boolean;
};

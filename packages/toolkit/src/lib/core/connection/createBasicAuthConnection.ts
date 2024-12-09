import { InputConfig } from '../../types/input-config.types';

export function createBasicAuthConnection(args: CreateBasicAuthConnectionArgs) {
  return {
    ...args,
    connectionType: 'basic',
  };
}

export type CreateBasicAuthConnectionArgs = {
  id: string;
  name: string;
  description: string;
  inputConfig?: InputConfig;
};

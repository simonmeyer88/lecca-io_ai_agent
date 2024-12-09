import { InputConfig } from '../../types/input-config.types';

export function createApiKeyConnection(args: CreateApiKeyConnectionArgs) {
  return {
    ...args,
    connectionType: 'apiKey',
  };
}

export type CreateApiKeyConnectionArgs = {
  id: string;
  name: string;
  description: string;
  inputConfig?: InputConfig;
};

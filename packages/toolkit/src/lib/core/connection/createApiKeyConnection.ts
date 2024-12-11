import { ConnectionType } from '../../types/connection.types';
import { InputConfig } from '../../types/input-config.types';

export function createApiKeyConnection(args: CreateApiKeyConnectionArgs) {
  return {
    ...args,
    connectionType: 'apiKey' as ConnectionType,
  };
}

export type CreateApiKeyConnectionArgs = {
  id: string;
  name: string;
  description: string;
  inputConfig?: InputConfig;
};

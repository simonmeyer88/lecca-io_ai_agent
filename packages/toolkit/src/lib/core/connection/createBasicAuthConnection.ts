import { ConnectionType } from '../../types/connection.types';
import { InputConfig } from '../../types/input-config.types';

export function createBasicAuthConnection(args: CreateBasicAuthConnectionArgs) {
  return {
    ...args,
    connectionType: 'basic' as ConnectionType,
  };
}

export type CreateBasicAuthConnectionArgs = {
  id: string;
  name: string;
  description: string;
  inputConfig?: InputConfig;
};

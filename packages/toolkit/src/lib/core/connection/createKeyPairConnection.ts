import { ConnectionType } from '../../types/connection.types';
import { InputConfig } from '../../types/input-config.types';

export function createKeyPairConnection(args: CreateKeyPairConnectionArgs) {
  return {
    ...args,
    connectionType: 'keyPair' as ConnectionType,
  };
}

export type CreateKeyPairConnectionArgs = {
  id: string;
  name: string;
  description: string;
  inputConfig?: InputConfig;
};

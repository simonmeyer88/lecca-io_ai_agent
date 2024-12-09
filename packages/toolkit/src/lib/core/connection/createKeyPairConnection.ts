import { InputConfig } from '../../types/input-config.types';

export function createKeyPairConnection(args: CreateKeyPairConnectionArgs) {
  return {
    ...args,
    connectionType: 'keyPair',
  };
}

export type CreateKeyPairConnectionArgs = {
  id: string;
  name: string;
  description: string;
  inputConfig?: InputConfig;
};

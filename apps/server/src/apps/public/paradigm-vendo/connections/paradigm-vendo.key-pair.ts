import {
  ConnectionConstructorArgs,
  KeyPairConnection,
} from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';

export class ParadigmVendoKeyPair extends KeyPairConnection {
  constructor(args: ConnectionConstructorArgs) {
    super(args);
  }

  id() {
    return 'paradigm-vendo-connection-key-pair';
  }
  name() {
    return 'Key Pair';
  }
  description() {
    return 'Connect using an a public/private key pair';
  }
  inputConfig(): InputConfig[] {
    return [];
  }
}

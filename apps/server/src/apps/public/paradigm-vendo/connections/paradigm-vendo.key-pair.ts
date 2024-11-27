import { KeyPairConnection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';

export class ParadigmVendoKeyPair extends KeyPairConnection {
  id = 'paradigm-vendo_connection_key-pair';
  name = 'Key Pair';
  description = 'Connect using an a public/private key pair';
  inputConfig: InputConfig[] = [];
}

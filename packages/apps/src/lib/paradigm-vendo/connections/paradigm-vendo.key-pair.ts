import { createKeyPairConnection } from '@lecca-io/toolkit';

export const paradigmVendoKeyPair = createKeyPairConnection({
  id: 'paradigm-vendo_connection_key-pair',
  name: 'Key Pair',
  description: 'Connect using an a public/private key pair',
});

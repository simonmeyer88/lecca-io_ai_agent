import {
  ApiKeyConnection,
  ConnectionConstructorArgs,
} from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';

export class VapiApiKey extends ApiKeyConnection {
  constructor(args: ConnectionConstructorArgs) {
    super(args);
  }

  id() {
    return 'vapi-connection-api-key';
  }
  name() {
    return 'Vapi Api IKe';
  }
  description() {
    return 'Connect using an API key';
  }
  inputConfig(): InputConfig[] {
    return [];
  }
}

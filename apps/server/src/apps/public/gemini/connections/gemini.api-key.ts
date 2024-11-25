import {
  ApiKeyConnection,
  ConnectionConstructorArgs,
} from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';

export class GeminiApiKey extends ApiKeyConnection {
  constructor(args: ConnectionConstructorArgs) {
    super(args);
  }

  id() {
    return 'gemini-connection-api-key';
  }
  name() {
    return 'API Key';
  }
  description() {
    return 'Connect using an API key';
  }
  inputConfig(): InputConfig[] {
    return [];
  }
}

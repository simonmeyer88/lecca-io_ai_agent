import { ApiKeyConnection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';

export class VapiApiKey extends ApiKeyConnection {
  id = 'vapi_connection_api-key';
  name = 'Vapi Api IKe';
  description = 'Connect using an API key';
  inputConfig: InputConfig[] = [];
}

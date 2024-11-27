import { ApiKeyConnection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';

export class SalesRabbitApiKey extends ApiKeyConnection {
  id = 'sales-rabbit_connection_api-key';
  name = 'API Key';
  description = 'Connect using an API key';
  inputConfig: InputConfig[] = [];
}

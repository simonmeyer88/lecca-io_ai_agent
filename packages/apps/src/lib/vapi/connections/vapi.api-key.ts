import { createApiKeyConnection } from '@lecca-io/toolkit';

export const vapiApiKey = createApiKeyConnection({
  id: 'vapi_connection_api-key',
  name: 'API Key',
  description: 'Connecto using an API Key',
});

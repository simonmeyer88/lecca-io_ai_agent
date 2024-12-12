import { createApiKeyConnection } from '@lecca-io/toolkit';

export const anthropicApiKey = createApiKeyConnection({
  id: 'anthropic_connection_api-key',
  name: 'API Key',
  description: 'Connect using an API key',
});

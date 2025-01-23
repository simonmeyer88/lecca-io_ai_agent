import { createApiKeyConnection } from '@lecca-io/toolkit';

export const togetheraiApiKey = createApiKeyConnection({
  id: 'togetherai_connection_api-key',
  name: 'API Key',
  description: 'Connect using an API key',
});

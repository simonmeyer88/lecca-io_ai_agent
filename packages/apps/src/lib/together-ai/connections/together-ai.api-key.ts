import { createApiKeyConnection } from '@lecca-io/toolkit';

export const togetherAiApiKey = createApiKeyConnection({
  id: 'together-ai_connection_api-key',
  name: 'API Key',
  description: 'Connect using an API key',
});

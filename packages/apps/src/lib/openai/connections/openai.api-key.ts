import { createApiKeyConnection } from '@lecca-io/toolkit';

export const openaiApiKey = createApiKeyConnection({
  id: 'openai_connection_api-key',
  name: 'API Key',
  description: 'Connect using an API key',
});

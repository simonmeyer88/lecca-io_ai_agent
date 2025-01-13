import { createApiKeyConnection } from '@lecca-io/toolkit';

export const surgemsgApiKey = createApiKeyConnection({
  id: 'surgemsg_connection_api-key',
  name: 'API Key',
  description: 'Connect using an API Key',
});

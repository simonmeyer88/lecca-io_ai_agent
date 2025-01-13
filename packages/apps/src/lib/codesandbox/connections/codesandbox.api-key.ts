import { createApiKeyConnection } from '@lecca-io/toolkit';

export const codesandboxApiKey = createApiKeyConnection({
  id: 'codesandbox_connection_-api-key',
  name: 'API Key',
  description: 'Connect using an API key',
});

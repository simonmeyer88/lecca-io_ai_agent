import { createApiKeyConnection } from '@lecca-io/toolkit';

export const anchorBrowserApiKey = createApiKeyConnection({
  id: 'anchor-browser_connection_api-key',
  name: 'API Key',
  description: 'Connect using an API key',
});

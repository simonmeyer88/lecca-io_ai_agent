import { createApiKeyConnection } from '@lecca-io/toolkit';

export const pineconeApiKey = createApiKeyConnection({
  id: 'pinecone_connection_api-key',
  name: 'API Key',
  description: 'Connect using an API Key',
});

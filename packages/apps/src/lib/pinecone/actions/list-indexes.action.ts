import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

export const listIndexes = createAction({
  id: 'pinecone_action_list-indexes',
  name: 'List Indexes',
  description: 'List all indexes in your Pinecone project',
  inputConfig: [],
  aiSchema: z.object({}),
  run: async ({ connection, workspaceId, http }) => {
    const response = await http.request({
      method: 'GET',
      url: 'https://api.pinecone.io/indexes',
      headers: {
        'Api-Key': connection.apiKey,
        'X-Pinecone-API-Version': '2024-10',
      },
      workspaceId,
    });

    return response.data;
  },
  mockRun: async () => {
    return {
      indexes: [
        {
          name: 'example-index-1',
          dimension: 1536,
          metric: 'cosine',
          host: 'example-index-1.pinecone.io',
          spec: {
            pod: {
              environment: 'gcp-starter',
              podType: 'p1.x1',
              pods: 1,
              replicas: 1,
              shards: 1,
            },
          },
          status: {
            ready: true,
            state: 'Ready',
          },
        },
      ],
    };
  },
});

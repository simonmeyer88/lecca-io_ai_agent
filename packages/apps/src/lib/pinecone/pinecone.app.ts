import { createApp } from '@lecca-io/toolkit';

import { listIndexes } from './actions/list-indexes.action';
import { queryVectors } from './actions/query-vectors.action';
import { upsertVector } from './actions/upsert-vector.action';
import { pineconeApiKey } from './connections/pinecone.api-key';

export const pinecone = createApp({
  id: 'pinecone',
  name: 'Pinecone',
  description:
    'Platform for building accurate, secure, and scalable AI applications.',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/pinecone.png',
  actions: [queryVectors, upsertVector, listIndexes],
  triggers: [],
  connections: [pineconeApiKey],
});

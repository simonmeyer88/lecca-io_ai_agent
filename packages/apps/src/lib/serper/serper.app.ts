import { createApp } from '@lecca-io/toolkit';

import { serperSearch } from './actions/serper-search.action';
import { serperApiKey } from './connections/serper.api-key';

export const serper = createApp({
  id: 'serper',
  name: 'Serper',
  description: 'Fast and cheap Google Search API',
  logoUrl: 'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/serper.jpg',
  actions: [serperSearch],
  triggers: [],
  connections: [serperApiKey],
});

import { createApp } from '@lecca-io/toolkit';

import { braveSearchAction } from './actions/brave-search.action';
import { braveSearchApiKey } from './connections/brave-search.api-key';

export const braveSearch = createApp({
  id: 'brave-search',
  name: 'Brave Search',
  description:
    'Power your search and AI apps with the fastest growing independent search engine since Bing',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/brave-search.png',
  actions: [braveSearchAction],
  triggers: [],
  connections: [braveSearchApiKey],
});

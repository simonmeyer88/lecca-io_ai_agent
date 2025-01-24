import { createApp } from '@lecca-io/toolkit';

import { extract } from './actions/extract.action';
import { scrape } from './actions/scrape.action';
import { firecrawlApiKey } from './connections/firecrawl.api-key';

export const firecrawl = createApp({
  id: 'firecrawl',
  name: 'Firecrawl',
  description:
    'Platform for crawling and convert any website into clean markdown or structured data',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/firecrawl.png',
  actions: [scrape, extract],
  triggers: [],
  connections: [firecrawlApiKey],
});

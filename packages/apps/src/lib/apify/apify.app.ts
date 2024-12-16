import { createApp } from '@lecca-io/toolkit';

import { getDatasetItems } from './actions/get-dataset-items.action';
import { listTasks } from './actions/list-tasks.action';
import { runTask } from './actions/run-task.action';
import { apifyApiKey } from './connections/apify.api-key';

export const apify = createApp({
  id: 'apify',
  name: 'Apify',
  logoUrl: 'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/apify.png',
  description: 'Cloud platform for web scraping and browser automation.',
  actions: [runTask, listTasks, getDatasetItems],
  triggers: [],
  connections: [apifyApiKey],
});

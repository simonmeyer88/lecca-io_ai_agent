import { createApp } from '@lecca-io/toolkit';

import { getBaseSchema } from './actions/get-base-schema.action';
import { listBases } from './actions/list-bases.action';
import { airtableApiKey } from './connections/airtable.api-key';

export const airtable = createApp({
  id: 'airtable',
  name: 'Airtable',
  description: 'Airtable is a cloud-based project management tool',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/airtable.svg',
  actions: [listBases, getBaseSchema],
  triggers: [],
  connections: [airtableApiKey],
});

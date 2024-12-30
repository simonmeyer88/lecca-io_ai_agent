import { createApp } from '@lecca-io/toolkit';

import { convertCsvToJson } from './actions/convert-csv-to-json.action';

export const csv = createApp({
  id: 'csv',
  name: 'CSV Tools',
  description: `CSV tools to manage csv data`,
  logoUrl: 'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/csv.svg',
  actions: [convertCsvToJson],
  triggers: [],
  connections: [],
});

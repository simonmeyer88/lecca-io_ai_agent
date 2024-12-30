import { createApp } from '@lecca-io/toolkit';

import { jsonParse } from './actions/json-parse.action';
import { jsonStringify } from './actions/json-stringify.action';

export const json = createApp({
  id: 'json',
  name: 'JSON Tools',
  description: `JSON tools to manage JSON data`,
  logoUrl: 'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/json.svg',
  actions: [jsonStringify, jsonParse],
  triggers: [],
  connections: [],
});

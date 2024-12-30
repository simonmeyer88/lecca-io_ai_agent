import { createApp } from '@lecca-io/toolkit';

import { formatDate } from './actions/format-date.action';
import { getCurrentDate } from './actions/get-current-date.action';
import { modifyDate } from './actions/modify-date.action';

export const date = createApp({
  id: 'date',
  name: 'Date Tools',
  description: `Date tools to manage dates`,
  logoUrl: 'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/date.svg',
  actions: [getCurrentDate, modifyDate, formatDate],
  triggers: [],
  connections: [],
});

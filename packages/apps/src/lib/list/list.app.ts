import { createApp } from '@lecca-io/toolkit';

import { combineLists } from './actions/combine-lists.actions';
import { countList } from './actions/count-list.action';
import { findItem } from './actions/find-item.action';
import { getFirstItem } from './actions/get-first-item-in-list.action';
import { getLastItem } from './actions/get-last-item-in-list.action';

export const list = createApp({
  id: 'list',
  name: 'List Tools',
  description: `List (array) tools offered by ${process.env.PLATFORM_NAME}`,
  logoUrl: 'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/list.svg',
  actions: [findItem, combineLists, getLastItem, getFirstItem, countList],
  triggers: [],
  connections: [],
});

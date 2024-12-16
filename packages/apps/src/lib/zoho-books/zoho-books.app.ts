import { createApp } from '@lecca-io/toolkit';

import { zohoBooksOAuth2US } from './connections/zoho-books.oauth2';

export const zohoBooks = createApp({
  id: 'zoho-books',
  name: 'Zoho Books',
  description:
    'Zoho Books is a cloud-based accounting software that is set to take your business a step further into the future.',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/zoho-books.png',
  actions: [],
  triggers: [],
  connections: [zohoBooksOAuth2US],
});

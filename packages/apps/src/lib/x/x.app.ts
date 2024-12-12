import { createApp } from '@lecca-io/toolkit';

import { createPost } from './actions/create-post.action';
import { replyToPost } from './actions/reply-to-post.action';
import { xOAuth2 } from './connections/x.oauth2';

export const x = createApp({
  id: 'x',
  name: 'X (Twitter)',
  description:
    'X is a social media platform that allows users to post and interact with messages known as "tweets".',
  logoUrl: 'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/x.svg',
  actions: [createPost, replyToPost],
  triggers: [],
  connections: [xOAuth2],
  needsConnection: true,
});

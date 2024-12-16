import { createApp } from '@lecca-io/toolkit';

import { searchVideos } from './actions/search-videos.action';
import { youtubeOAuth2 } from './connections/youtube.oauth2';

export const youtube = createApp({
  id: 'youtube',
  name: 'Youtube',
  description: 'YouTube is an online video sharing platform owned by Google.',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/youtube.svg',
  actions: [searchVideos],
  triggers: [],
  connections: [youtubeOAuth2],
});

import { createApp } from '@lecca-io/toolkit';

import { googleSlidesOAuth2 } from './connections/google-slides.oauth2';

export const googleSlides = createApp({
  id: 'google-slides',
  name: 'Google Slides',
  description:
    'Google Slides a slideshow presentation program developed by Google.',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/google-slides.svg',
  actions: [],
  triggers: [],
  connections: [googleSlidesOAuth2],
});

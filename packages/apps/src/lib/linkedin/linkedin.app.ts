import { createApp } from '@lecca-io/toolkit';

import { createImagePost } from './actions/create-image-post.action';
import { createOrganizationImagePost } from './actions/create-organization-image-post.action';
import { createOrganizationTextPost } from './actions/create-organization-text-post.action';
import { createTextPost } from './actions/create-text-post.action';
import { linkedinOAuth2 } from './connections/linkedin.oauth2';

export const linkedin = createApp({
  id: 'linkedin',
  name: 'Linkedin',
  description:
    'LinkedIn is a professional networking platform that connects professionals around the world.',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/linkedin.svg',
  actions: [
    createTextPost,
    createImagePost,
    createOrganizationTextPost,
    createOrganizationImagePost,
  ],
  triggers: [],
  connections: [linkedinOAuth2],
  needsConnection: true,
});

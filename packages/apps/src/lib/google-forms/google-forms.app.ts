import { createApp } from '@lecca-io/toolkit';

import { googleFormsOAuth2 } from './connections/google-forms.oauth2';
import { newFormResponse } from './triggers/new-form-response.trigger';

export const googleForms = createApp({
  id: 'google-forms',
  name: 'Google Forms',
  description:
    'Use Google Forms to create online forms and surveys with multiple question types.',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/google-forms.svg',
  actions: [],
  triggers: [newFormResponse],
  connections: [googleFormsOAuth2],
});

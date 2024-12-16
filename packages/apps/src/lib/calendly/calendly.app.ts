import { createApp } from '@lecca-io/toolkit';

import { listOrganizationEvents } from './actions/list-organization-events.action';
import listUserEvents from './actions/list-user-events.action';
import { calendlyOAuth2 } from './connections/calendly.oauth2';

export const calendly = createApp({
  id: 'calendly',
  name: 'Calendly',
  description: 'Calendly is a modern scheduling platform.',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/calendly.svg',
  actions: [listOrganizationEvents, listUserEvents],
  triggers: [],
  connections: [calendlyOAuth2],
});

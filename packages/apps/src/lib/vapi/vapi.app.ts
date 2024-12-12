import { createApp } from '@lecca-io/toolkit';

import { getPhoneCall } from './actions/get-phone-call.action';
import { listAssistants } from './actions/list-assistants.action';
import { listPhoneNumbers } from './actions/list-phone-numbers.action';
import { makePhoneCall } from './actions/make-phone-call.action';
import { vapiApiKey } from './connections/vapi.api-key';

export const vapi = createApp({
  id: 'vapi',
  name: 'Vapi',
  description: 'Vapi is the platform to build, test and deploy voice agents',
  logoUrl: 'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/vapi.svg',
  actions: [makePhoneCall, getPhoneCall, listAssistants, listPhoneNumbers],
  triggers: [],
  connections: [vapiApiKey],
  needsConnection: true,
});

import { createApp } from '@lecca-io/toolkit';

import { manualTrigger } from './triggers/manual-trigger.trigger';

export const flowControl = createApp({
  id: 'flow-control',
  name: 'Flow Control',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/flow-control.svg',
  description: 'Triggers and actions to control the flow of your workflow',
  actions: [],
  triggers: [manualTrigger],
  connections: [],
  needsConnection: false,
});

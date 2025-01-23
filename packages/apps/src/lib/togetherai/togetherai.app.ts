import { createApp } from '@lecca-io/toolkit';

import { chatFromText } from './actions/chat-from-text.action';
import { togetheraiApiKey } from './connections/togetherai.api-key';

export const togetherai = createApp({
  id: 'togetherai',
  name: 'together.ai',
  description: 'Train, fine-tune-and run inference on AI models',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/togetherai.svg',
  actions: [chatFromText],
  triggers: [],
  connections: [togetheraiApiKey],
});

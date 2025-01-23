import { createApp } from '@lecca-io/toolkit';

import { chatFromText } from './actions/chat-from-text.action';
import { togetherAiApiKey } from './connections/together-ai.api-key';

export const togetherAi = createApp({
  id: 'together-ai',
  name: 'together.ai',
  description: 'Train, fine-tune-and run inference on AI models',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/together-ai.png',
  actions: [chatFromText],
  triggers: [],
  connections: [togetherAiApiKey],
});

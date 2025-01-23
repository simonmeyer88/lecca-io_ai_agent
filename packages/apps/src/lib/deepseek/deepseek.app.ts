import { createApp } from '@lecca-io/toolkit';

import { chatFromText } from './actions/chat-from-text.action';
import { deepSeekApiKey } from './connections/deepseek.api-key';

export const deepseek = createApp({
  id: 'deepseek',
  name: 'DeepSeek',
  description: 'Open source Large Language Models',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/deepseek.svg',
  actions: [chatFromText],
  triggers: [],
  connections: [deepSeekApiKey],
});

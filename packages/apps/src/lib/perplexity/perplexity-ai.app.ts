import { createApp } from '@lecca-io/toolkit';

import { createChatCompletion } from './actions/create-chat-completion.action';
import { perplexityAiApiKey } from './connections/perplexity-ai.api-key';

export const perplexityAi = createApp({
  id: 'perplexity-ai',
  name: 'Perplexity AI',
  description:
    'AI search engine designed to revolutionize the way you discover information',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/perplexity-ai.svg',
  actions: [createChatCompletion],
  triggers: [],
  connections: [perplexityAiApiKey],
});

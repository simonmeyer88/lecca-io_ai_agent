import { createApp } from '@lecca-io/toolkit';

import { chatFromText } from './actions/chat-from-text.action';
import { anthropicApiKey } from './connections/anthropic.api-key';

export const anthropic = createApp({
  id: 'anthropic',
  name: 'Anthropic Claude',
  description:
    'Anthropic provides a powerful AI model, Claude, that can be used to generate human-like text.',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/anthropic.svg',
  actions: [chatFromText],
  triggers: [],
  connections: [anthropicApiKey],
  needsConnection: true,
});

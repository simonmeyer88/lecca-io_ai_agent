import { createApp } from '@lecca-io/toolkit';

import { chatFromText } from './actions/chat-from-text.action';
import { geminiApiKey } from './connections/gemini.api-key';

export const gemini = createApp({
  id: 'gemini',
  name: 'Gemini',
  description:
    'Gemini provides powerfuls AI models that can be used to generate human-like text.',
  logoUrl: 'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/gemini.svg',
  actions: [chatFromText],
  triggers: [],
  connections: [geminiApiKey],
});

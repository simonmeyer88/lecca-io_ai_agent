import { createApp } from '@lecca-io/toolkit';

import { askWebpage } from './actions/ask-webpage.action';
import { getWebpageContent } from './actions/get-webpage-content.action';
import { performWebTask } from './actions/perform-web-task.action';
import { anchorBrowserApiKey } from './connections/anchor-browser.api-key';

export const anchorBrowser = createApp({
  id: 'anchor-browser',
  name: 'Anchor Browser',
  description:
    'Anchor provides a seamless way to define, deploy, and maintain browser automations.',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/anchor-browser.png',
  actions: [
    getWebpageContent,
    askWebpage,
    performWebTask,
    // screenshotWebpage
  ],
  triggers: [],
  connections: [anchorBrowserApiKey],
});

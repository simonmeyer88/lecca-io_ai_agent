import { createApp } from '@lecca-io/toolkit';

import { runJavascript } from './actions/run-javascript.action';
import { runPython } from './actions/run-python.action';
import { codesandboxApiKey } from './connections/codesandbox.api-key';

export const codesandbox = createApp({
  id: 'codesandbox',
  name: 'CodeSandbox',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/codesandbox.svg',
  description:
    'CodeSandbox SDK enables you to quickly create and run isolated sandboxes securely.',
  actions: [runJavascript, runPython],
  triggers: [],
  connections: [codesandboxApiKey],
});

import { CodeSandbox } from '@codesandbox/sdk';
import {
  createAction,
  createCodeInputField,
  createMarkdownField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

export const runJavascript = createAction({
  id: 'codesandbox_action_run-javascript',
  name: 'Write Javascript',
  description: 'Run javascript code',
  inputConfig: [
    createCodeInputField({
      id: 'code',
      label: 'Code to execute',
      description: 'Enter the javascript code you want to execute. ',
      placeholder: 'console.log("Hello, World!")',
    }),
    createMarkdownField({
      id: 'markdown1',
      markdown:
        'The only way to return data from your code execution is to use console.log. All logs will be added to the output field.',
    }),
  ],
  aiSchema: z.object({
    code: z.string().describe('The javascript code to execute'),
  }),
  run: async ({ connection, configValue }) => {
    const { code } = configValue;
    const { apiKey } = connection;
    const sdk = new CodeSandbox(apiKey);
    const sandbox = await sdk.sandbox.create();
    const command = await sandbox.shells.js.run(code ?? '');

    return {
      output: command.output,
      sandboxId: sandbox.id,
    };
  },
  mockRun: async () => {
    return {
      output: 'The output from any console.logs',
      sandboxId: 'sandbox-id',
    };
  },
});

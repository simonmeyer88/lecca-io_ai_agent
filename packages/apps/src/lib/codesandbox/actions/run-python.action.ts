import { CodeSandbox } from '@codesandbox/sdk';
import {
  createAction,
  createCodeInputField,
  createMarkdownField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

export const runPython = createAction({
  id: 'codesandbox_action_run-python',
  name: 'Write Python',
  description: 'Run python code',
  inputConfig: [
    createCodeInputField({
      id: 'code',
      label: 'Code to execute',
      description: 'Enter the python code you want to execute. ',
      placeholder: 'print("Hello, World!")',
    }),
    createMarkdownField({
      id: 'markdown1',
      markdown:
        'The only way to return data from your code execution is to use print. All print statements will be added to the output field.',
    }),
  ],
  aiSchema: z.object({
    code: z.string().describe('The python code to execute'),
  }),
  run: async ({ connection, configValue }) => {
    const { code } = configValue;
    const { apiKey } = connection;
    const sdk = new CodeSandbox(apiKey);
    const sandbox = await sdk.sandbox.create();
    const command = await sandbox.shells.python.run(code ?? '');

    return {
      output: command.output,
      sandboxId: sandbox.id,
    };
  },
  mockRun: async () => {
    return {
      output: 'The output from any print statements',
      sandboxId: 'sandbox-id',
    };
  },
});

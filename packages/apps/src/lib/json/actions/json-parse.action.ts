import { createAction, jsonParse as jsonParseUtil } from '@lecca-io/toolkit';
import { createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const jsonParse = createAction({
  id: 'json_action_parse',
  name: 'JSON Parse',
  description: 'Parses a JSON string and returns a JavaScript object.',
  viewOptions: {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
      },
    },
  },
  inputConfig: [
    createTextInputField({
      id: 'jsonString',
      label: 'Value',
      description: 'The JSON string to parse into an object.',
      placeholder: 'Enter JSON string',
      required: {
        missingMessage: 'JSON string is required',
        missingStatus: 'warning',
      },
    }),
  ],
  aiSchema: z.object({
    jsonString: z.string().describe('JSON string to parse'),
  }),
  run: async ({ configValue }) => {
    const { jsonString } = configValue;
    return { result: jsonParseUtil(jsonString) };
  },
  mockRun: async () => {
    return { result: { key: 'value' } };
  },
});

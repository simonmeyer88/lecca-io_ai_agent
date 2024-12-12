import {
  createAction,
  createNumberInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

export const jsonStringify = createAction({
  id: 'json_action_stringify',
  name: 'JSON Stringify',
  description: 'Converts a JavaScript object or value to a JSON string.',
  viewOptions: {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
      },
    },
  },
  aiSchema: z.object({
    value: z.any().describe('Object or value to stringify'),
    space: z
      .number()
      .optional()
      .describe('Number of spaces for indentation (optional)'),
  }),
  inputConfig: [
    createTextInputField({
      id: 'value',
      label: 'Value',
      description: 'The object or value to stringify.',
      placeholder: 'Enter Javascript object or value',
      required: {
        missingMessage: 'Value is required',
        missingStatus: 'warning',
      },
    }),
    createNumberInputField({
      id: 'space',
      label: 'Indentation Spaces',
      description:
        'Optional: Number of spaces to use for indentation in the JSON string.',
      placeholder: 'Add spaces (optional)',
    }),
  ],
  run: async ({ configValue }) => {
    const { value, space } = configValue;
    const result = JSON.stringify(value, null, space || 0);
    return { result };
  },
  mockRun: async () => {
    return { result: '{"key": "value"}' };
  },
});

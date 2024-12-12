import {
  createAction,
  createSwitchInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

export const replace = createAction({
  id: 'text_action_replace',
  name: 'Replace',
  iconUrl: `${process.env.INTEGRATION_ICON_BASE_URL}/apps/text.svg`,
  description: 'Replaces search results.',
  viewOptions: {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
      },
    },
  },
  aiSchema: z.object({
    text: z.string().min(1).describe('text to search'),
    query: z
      .string()
      .min(1)
      .describe('Text string or regex string to search text'),
    replaceValue: z.string().describe('Value that will replace search results'),
    replaceFirstResult: z
      .enum(['true', 'false'])
      .describe('If true, only returns the first result'),
  }),
  inputConfig: [
    createTextInputField({
      id: 'text',
      label: 'Text to Search',
      description: '',
      required: {
        missingMessage: 'Text is required',
        missingStatus: 'warning',
      },
    }),
    createTextInputField({
      id: 'query',
      label: 'Search Query',
      description: 'Search query can be text or a regular expression.',
      placeholder: 'Add search text or a regular expression.',
      required: {
        missingMessage: 'Search query is required',
        missingStatus: 'warning',
      },
    }),
    createTextInputField({
      id: 'replaceValue',
      label: 'Replace Value',
      description: 'Value that will replace all results',
      placeholder: 'Add value',
      required: {
        missingMessage: 'Replace value is required',
        missingStatus: 'warning',
      },
    }),
    createSwitchInputField({
      id: 'replaceFirstResult',
      label: 'Replace first result',
      description: 'If true, only the first match will be replaced',
      switchOptions: {
        checked: 'true',
        unchecked: 'false',
        defaultChecked: false,
      },
    }),
  ],
  run: async ({ configValue }) => {
    const { text, query, replaceFirstResult, replaceValue } = configValue;
    let expression = RegExp(query);

    if (replaceFirstResult === 'true') {
      return { result: text.replace(expression, replaceValue ?? '') ?? null };
    } else {
      if (expression instanceof RegExp && !expression.flags.includes('g')) {
        expression = new RegExp(expression.source, expression.flags + 'g');
      }
      return { result: text.replaceAll(expression, replaceValue ?? '') };
    }
  },
  mockRun: async ({ configValue }) => {
    const { replaceFirstResult } = configValue;

    if (replaceFirstResult === 'true') {
      return { result: 'replaced text' };
    } else {
      return { result: 'replaced text' };
    }
  },
});

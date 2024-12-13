import {
  createAction,
  createSwitchInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

export const search = createAction({
  id: 'text_action_search',
  name: 'Search Text',
  iconUrl: `https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/text.svg`,
  viewOptions: {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
      },
    },
  },
  description: 'Find text using a query.',
  aiSchema: z.object({
    text: z.string().min(1).describe('text to search'),
    query: z
      .string()
      .min(1)
      .describe('Text string or regex string to search text'),
    returnFirstResult: z
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
    createSwitchInputField({
      id: 'returnFirstResult',
      label: 'Return first result',
      description:
        'The results will not be a list of results, it will just be the first result found.',
      switchOptions: {
        checked: 'true',
        unchecked: 'false',
        defaultChecked: false,
      },
    }),
  ],
  run: async ({ configValue }) => {
    const { text, query, returnFirstResult } = configValue;

    const expression = new RegExp(query, 'g');
    const matches = text.match(expression);

    if (!matches) {
      return { result: null };
    }

    if (returnFirstResult === 'true') {
      return { result: matches[0] ?? null };
    } else {
      return { results: matches };
    }
  },
  mockRun: async ({ configValue }) => {
    const { returnFirstResult } = configValue;

    if (returnFirstResult === 'true') {
      return { result: 'result 1' };
    } else {
      return { results: ['result 1', 'result 2'] };
    }
  },
});

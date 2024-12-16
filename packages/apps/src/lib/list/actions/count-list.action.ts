import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const countList = createAction({
  id: 'list_action_count',
  name: 'Count list items',
  description: 'Counts the number of items in a list',
  iconUrl: `https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/list.svg`,
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
      id: 'listOfItems',
      label: 'List',
      description:
        'Provide a list of items where the search will be performed.',
      required: {
        missingMessage: 'List is required',
        missingStatus: 'warning',
      },
    }),
  ],
  aiSchema: z.object({
    listOfItems: z
      .array(z.any())
      .describe('The list of items from which to find the value'),
  }),
  run: async ({ configValue }) => {
    const { listOfItems } = configValue;

    let list;
    if (typeof listOfItems === 'string') {
      try {
        list = JSON.parse(listOfItems);
        if (!Array.isArray(list)) {
          throw new Error('List must be a valid JSON array');
        }
      } catch {
        throw new Error('List must be a valid stringified JSON array');
      }
    } else if (Array.isArray(listOfItems)) {
      list = listOfItems;
    } else {
      throw new Error(
        'List must be a valid stringified JSON array or an array of values',
      );
    }

    return { result: list.length };
  },
  mockRun: async () => {
    return { result: 2 };
  },
});

import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const findItem = createAction({
  id: 'list_action_find-item',
  name: 'Find Item in List',
  description:
    'Finds a specified item in a list of values and returns the item and its index',
  iconUrl: `https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/list.svg`,
  viewOptions: {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
      },
    },
  },
  aiSchema: z.object({
    listOfItems: z
      .array(z.any())
      .describe('The list of items from which to find the value'),
    itemToFind: z.any().describe('The item to find in the list'),
  }),
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
    createTextInputField({
      id: 'itemToFind',
      label: 'Item to Find',
      description: 'Provide the item to search for in the list.',
      required: {
        missingMessage: 'Item to find is required',
        missingStatus: 'warning',
      },
    }),
  ],
  run: async ({ configValue }) => {
    const { listOfItems, itemToFind } = configValue;

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

    const foundIndex = list.indexOf(itemToFind);
    const foundItem = foundIndex !== -1 ? list[foundIndex] : null;

    return { result: foundItem, index: foundIndex !== -1 ? foundIndex : null };
  },
  mockRun: async () => {
    return { result: 'found-item', index: 1 };
  },
});

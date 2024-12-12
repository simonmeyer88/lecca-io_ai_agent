import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const getLastItem = createAction({
  id: 'list_action_get-last-item',
  name: 'Get Last Item in List',
  description: 'Gets the last item from a list of values',
  iconUrl: `${process.env.INTEGRATION_ICON_BASE_URL}/apps/list.svg`,
  needsConnection: false,
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
      .describe('The list of items from which to get the last item'),
  }),
  inputConfig: [
    createTextInputField({
      id: 'listOfItems',
      label: 'List',
      description:
        'Provide a list of items, and this action will return the last item.',
      required: {
        missingMessage: 'List is required',
        missingStatus: 'warning',
      },
    }),
  ],
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

    const lastItem = list[list.length - 1] ?? null;

    return { result: lastItem };
  },
  mockRun: async () => {
    return { result: 'last-item' };
  },
});

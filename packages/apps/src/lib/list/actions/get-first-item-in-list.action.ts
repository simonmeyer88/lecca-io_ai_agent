import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const getFirstItem = createAction({
  id: 'list_action_get-first-item',
  name: 'Get First Item in List',
  description: 'Gets the first item from a list of values',
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
  inputConfig: [
    createTextInputField({
      id: 'listOfItems',
      label: 'List',
      description:
        'Provide a list of items, and this action will return the first item.',
      required: {
        missingMessage: 'List is required',
        missingStatus: 'warning',
      },
    }),
  ],
  aiSchema: z.object({
    listOfItems: z
      .array(z.any())
      .describe('The list of items from which to get the first item'),
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

    const firstItem = list[0] ?? null;

    return { result: firstItem };
  },
  mockRun: async () => {
    return { result: 'first-item' };
  },
});

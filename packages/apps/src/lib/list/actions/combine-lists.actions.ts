import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const combineLists = createAction({
  id: 'list_action_combine-lists',
  name: 'Combine Lists',
  description: 'Combines multiple lists into a single list',
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
    listOfListItems: z
      .array(z.array(z.string()))
      .min(1)
      .describe('List of lists to combine'),
  }),
  inputConfig: [
    createTextInputField({
      id: 'listOfListItems',
      label: 'List Items',
      description:
        'Each item should be a string or a list of values. E.g. ["a", "b"], "c", ["d"] would become ["a", "b", "c", "d"]',
      occurenceType: 'multiple',
      required: {
        missingMessage: 'At least one list is required',
        missingStatus: 'warning',
      },
    }),
  ],
  run: async ({ configValue }) => {
    const { listOfListItems } = configValue;

    const parsedItems =
      listOfListItems?.map((item) => {
        if (typeof item === 'string') {
          try {
            return JSON.parse(item);
          } catch {
            return item;
          }
        } else if (Array.isArray(item)) {
          return item;
        } else if (typeof item === 'number' || typeof item === 'string') {
          return item;
        } else {
          throw new Error(
            'Each item must be either a JSON-stringified array, an array, or a single value (number or string).',
          );
        }
      }) ?? [];

    const combinedList = parsedItems.flat();

    return { result: combinedList };
  },
  mockRun: async () => {
    return { result: ['a', 'b', 'c', 'd', 'e', 'f'] };
  },
});

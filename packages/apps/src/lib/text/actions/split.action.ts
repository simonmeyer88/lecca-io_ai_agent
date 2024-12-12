import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const split = createAction({
  id: 'text_action_split',
  name: 'Split',
  description: 'Splits text be a delimiter',
  iconUrl: `${process.env.INTEGRATION_ICON_BASE_URL}/apps/text.svg`,
  viewOptions: {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
      },
    },
  },
  aiSchema: z.object({
    text: z.string().describe('String to split'),
    delimiter: z.string(),
  }),
  inputConfig: [
    createTextInputField({
      id: 'text',
      label: 'Text',
      description: '',
      required: {
        missingMessage: 'Text is required',
        missingStatus: 'warning',
      },
    }),
    createTextInputField({
      id: 'delimiter',
      label: 'Delimiter',
      description: 'This is the sequence of characters to split the text by.',
      placeholder: 'Add delimiter',
    }),
  ],
  run: async ({ configValue }) => {
    const { text, delimiter } = configValue;
    return { result: text.split(delimiter) };
  },
  mockRun: async () => {
    return { result: ['text1', 'test2', 'text3'] };
  },
});

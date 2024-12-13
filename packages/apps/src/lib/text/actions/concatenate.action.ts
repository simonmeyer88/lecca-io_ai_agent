import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const concatenate = createAction({
  id: 'text_action_concatenate',
  name: 'Concatenate Text',
  description: 'Concatenates two more texts together',
  iconUrl: `https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/text.svg`,
  viewOptions: {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
      },
    },
  },
  aiSchema: z.object({
    texts: z.array(z.string()).min(1).describe('texts to join'),
    separator: z
      .string()
      .nullable()
      .optional()
      .describe('The character used to join the texts'),
  }),
  inputConfig: [
    createTextInputField({
      id: 'texts',
      label: 'Text',
      description: '',
      occurenceType: 'multiple',
      required: {
        missingMessage: 'Text is required',
        missingStatus: 'warning',
      },
    }),
    createTextInputField({
      id: 'separator',
      label: 'Separator',
      description:
        'The text character that is used between each text. For example, if you enter ",", all the texts will be joined together with a "," between them.',
      placeholder: 'Add optional text',
    }),
  ],
  run: async ({ configValue }) => {
    const { texts, separator } = configValue;
    return { result: texts?.join(separator ?? '') ?? '' };
  },
  mockRun: async () => {
    return { result: 'text1,test2,text3' };
  },
});

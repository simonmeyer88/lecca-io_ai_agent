import { createAction } from '@lecca-io/toolkit';
import { createNumberInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const multiplication = createAction({
  id: 'math_action_multiplication',
  name: 'Multiplication',
  description: 'Multiplies two numbers together.',
  iconUrl: `${process.env.INTEGRATION_ICON_BASE_URL}/apps/math.svg`,
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
    number1: z.number(),
    number2: z.number(),
  }),
  inputConfig: [
    createNumberInputField({
      id: 'number1',
      label: 'First Number',
      description: '',
      required: {
        missingMessage: 'First number is required',
        missingStatus: 'warning',
      },
    }),
    createNumberInputField({
      id: 'number2',
      label: 'Second Number',
      description: '',
      required: {
        missingMessage: 'Second number is required',
        missingStatus: 'warning',
      },
    }),
  ],
  run: async ({ configValue }) => {
    const num1 = Number(configValue.number1);
    const num2 = Number(configValue.number2);

    return { result: num1 * num2 };
  },
  mockRun: async () => {
    return { result: 42 };
  },
});

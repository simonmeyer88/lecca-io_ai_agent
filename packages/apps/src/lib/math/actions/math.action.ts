import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { evaluate } from 'mathjs';
import { z } from 'zod';

export const mathExpression = createAction({
  id: 'math_action_math',
  name: 'Evaluate Expression',
  description: 'Evaluate a mathematical expression',
  iconUrl: `https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/math.svg`,
  viewOptions: {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
      },
    },
  },
  aiSchema: z.object({
    expression: z
      .string()
      .min(1)
      .describe('The mathematical expression to evaluate using mathjs syntax'),
  }),
  inputConfig: [
    createTextInputField({
      id: 'expression',
      label: 'Math Expression',
      description: 'Enter the mathematical expression to evaluate.',
      required: {
        missingMessage: 'Math expression is required',
        missingStatus: 'warning',
      },
      placeholder: 'e.g., 2 + 2 * (3 / 4)',
    }),
    {
      id: 'markdown',
      label: '',
      description: '',
      inputType: 'markdown',
      markdown:
        'Click [here](https://mathjs.org/docs/expressions/syntax.html) to learn more about syntax',
    },
  ],
  run: async ({ configValue }) => {
    const { expression } = configValue;

    if (!expression) {
      throw new Error('No math expression provided');
    }

    try {
      const result = evaluate(expression);

      if (typeof result !== 'number') {
        throw new Error('Expression did not evaluate to a number: ' + result);
      }

      return { result };
    } catch (error) {
      throw new Error(`Error evaluating expression: ${error.message}`);
    }
  },
  mockRun: async () => {
    return { result: 42 };
  },
});

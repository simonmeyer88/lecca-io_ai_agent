import { evaluate } from 'mathjs';
import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { NodeViewOptions } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { Math as MathApp } from '../math.app';

export class Math extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: MathApp;

  id = 'math_action_math';
  name = 'Evaluate Expression';
  iconUrl: null | string =
    `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.app.id}.svg`;
  needsConnection = false;
  description = 'Evaluate a mathematical expression.';
  viewOptions: null | NodeViewOptions = {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
      },
    },
  };
  aiSchema = z.object({
    expression: z
      .string()
      .min(1)
      .describe('The mathematical expression to evaluate using mathjs syntax'),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'expression',
      label: 'Math Expression',
      description: 'Enter the mathematical expression to evaluate.',
      inputType: 'text',
      required: {
        missingMessage: 'Math expression is required',
        missingStatus: 'warning',
      },
      placeholder: 'e.g., 2 + 2 * (3 / 4)',
    },
    {
      id: 'markdown',
      label: '',
      description: '',
      inputType: 'markdown',
      markdown:
        'Click [here](https://mathjs.org/docs/expressions/syntax.html) to learn more about syntax',
    },
  ];

  async run({ configValue }: RunActionArgs<ConfigValue>): Promise<Response> {
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
  }

  async mockRun(): Promise<unknown> {
    return { result: 42 };
  }
}

type ConfigValue = z.infer<Math['aiSchema']>;

type Response = {
  result: number;
};

import {
  Action,
  RunActionArgs,
  ActionConstructorArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { evaluate } from 'mathjs';
import { z } from 'zod';
import { Math as MathApp } from '../math.app';
import { NodeViewOptions } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

export class Math extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: MathApp;

  id() {
    return 'math_action_math';
  }

  name() {
    return 'Evaluate Expression';
  }

  iconUrl(): null | string {
    return `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.app.id}.svg`;
  }

  needsConnection(): boolean {
    return false;
  }

  description() {
    return 'Evaluate a mathematical expression.';
  }

  viewOptions(): null | NodeViewOptions {
    return {
      saveButtonOptions: {
        replaceSaveAndTestButton: {
          label: 'Save & Test',
          type: 'real',
        },
      },
    };
  }

  aiSchema() {
    return z.object({
      expression: z
        .string()
        .min(1)
        .describe(
          'The mathematical expression to evaluate using mathjs syntax',
        ),
    });
  }

  inputConfig(): InputConfig[] {
    return [
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
  }

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

type ConfigValue = {
  expression: string;
};

type Response = {
  result: number;
};

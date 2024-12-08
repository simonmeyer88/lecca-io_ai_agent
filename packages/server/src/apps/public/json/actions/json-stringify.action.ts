import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { NodeViewOptions } from '@/apps/lib/trigger';

import { JSON as JsonApp } from '../json.app';

export class JsonStringify extends Action {
  app: JsonApp;
  id = 'json_action_stringify';
  name = 'JSON Stringify';
  needsConnection = false;
  description = 'Converts a JavaScript object or value to a JSON string.';
  viewOptions: null | NodeViewOptions = {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
      },
    },
  };
  aiSchema = z.object({
    value: z.any().describe('Object or value to stringify'),
    space: z
      .number()
      .optional()
      .describe('Number of spaces for indentation (optional)'),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'value',
      label: 'Value',
      description: 'The object or value to stringify.',
      placeholder: 'Enter Javascript object or value',
      inputType: 'text', // assuming input will be stringified as text
      required: {
        missingMessage: 'Value is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'space',
      label: 'Indentation Spaces',
      description:
        'Optional: Number of spaces to use for indentation in the JSON string.',
      inputType: 'number',
      placeholder: 'Add spaces (optional)',
    },
  ];

  async run({ configValue }: RunActionArgs<ConfigValue>): Promise<Response> {
    const { value, space } = configValue;
    const result = JSON.stringify(value, null, space || 0);

    return { result };
  }

  async mockRun(): Promise<unknown> {
    return { result: '{"key": "value"}' };
  }
}

type ConfigValue = z.infer<JsonStringify['aiSchema']>;

type Response = {
  result: string;
};

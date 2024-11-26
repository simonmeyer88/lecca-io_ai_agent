import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { NodeViewOptions } from '@/apps/lib/trigger';
import { jsonParse } from '@/apps/utils/json-parse';

import { JSON as JsonApp } from '../json.app';

export class JsonParse extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: JsonApp;

  id() {
    return 'json_action_parse';
  }

  name() {
    return 'JSON Parse';
  }

  needsConnection(): boolean {
    return false;
  }

  description() {
    return 'Parses a JSON string and returns a JavaScript object.';
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
      jsonString: z.string().describe('JSON string to parse'),
    });
  }

  inputConfig(): InputConfig[] {
    return [
      {
        id: 'jsonString',
        label: 'Value',
        description: 'The JSON string to parse into an object.',
        inputType: 'text',
        placeholder: 'Enter JSON string',
        required: {
          missingMessage: 'JSON string is required',
          missingStatus: 'warning',
        },
      },
    ];
  }

  async run({ configValue }: RunActionArgs<ConfigValue>): Promise<Response> {
    const { jsonString } = configValue;

    return { result: jsonParse(jsonString) };
  }

  async mockRun(): Promise<unknown> {
    return { result: { key: 'value' } };
  }
}

type ConfigValue = z.infer<ReturnType<JsonParse['aiSchema']>>;

type Response = {
  result: Record<string, unknown> | unknown[] | string | number | boolean;
};

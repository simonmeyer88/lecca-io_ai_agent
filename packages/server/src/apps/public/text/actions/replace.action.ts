import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { NodeViewOptions } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { Text } from '../text.app';

export class Replace extends Action {
  app: Text;

  id = 'text_action_replace';
  name = 'Replace';
  iconUrl: null | string =
    `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.app.id}.svg`;
  needsConnection = false;
  description = 'Replaces search results.';
  viewOptions: null | NodeViewOptions = {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
      },
    },
  };
  aiSchema = z.object({
    text: z.string().min(1).describe('text to search'),
    query: z
      .string()
      .min(1)
      .describe('Text string or regex string to search text'),
    replaceValue: z.string().describe('Value that will replace search results'),
    replaceFirstResult: z
      .enum(['true', 'false'])
      .describe('If true, only returns the first result'),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'text',
      label: 'Text to Search',
      description: '',
      inputType: 'text',
      required: {
        missingMessage: 'Text is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'query',
      label: 'Search Query',
      description: 'Search query can be text or a regular expression.',
      inputType: 'text',
      placeholder: 'Add search text or a regular expression.',
      required: {
        missingMessage: 'Search query is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'replaceValue',
      label: 'Replace Value',
      description: 'Value that will replace all results',
      inputType: 'text',
      placeholder: 'Add value',
      required: {
        missingMessage: 'Replace value is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'replaceFirstResult',
      label: 'Replace first result',
      description: '',
      inputType: 'switch',
      switchOptions: {
        checked: 'true',
        unchecked: 'false',
        defaultChecked: false,
      },
    },
  ];

  async run({ configValue }: RunActionArgs<ConfigValue>): Promise<Response> {
    const { text, query, replaceFirstResult, replaceValue } = configValue;
    let expression = RegExp(query);

    if (replaceFirstResult === 'true') {
      return { result: text.replace(expression, replaceValue ?? '') ?? null };
    } else {
      if (expression instanceof RegExp && !expression.flags.includes('g')) {
        expression = new RegExp(expression.source, expression.flags + 'g');
      }
      return { result: text.replaceAll(expression, replaceValue ?? '') };
    }
  }

  async mockRun({
    configValue,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
    const { replaceFirstResult } = configValue;

    if (replaceFirstResult === 'true') {
      return { result: 'replaced text' };
    } else {
      return { result: 'replaced text' };
    }
  }
}

type ConfigValue = z.infer<Replace['aiSchema']>;

type Response = {
  result: string | null;
};

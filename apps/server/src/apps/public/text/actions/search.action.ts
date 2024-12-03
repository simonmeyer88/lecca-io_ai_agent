import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { NodeViewOptions } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { Text } from '../text.app';

export class Search extends Action {
  app: Text;
  id = 'text_action_search';
  name = 'Search Text';
  iconUrl: null | string =
    `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.app.id}.svg`;
  needsConnection = false;
  viewOptions: null | NodeViewOptions = {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
      },
    },
  };
  description = 'Find text using a query.';
  aiSchema = z.object({
    text: z.string().min(1).describe('text to search'),
    query: z
      .string()
      .min(1)
      .describe('Text string or regex string to search text'),
    returnFirstResult: z
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
      id: 'returnFirstResult',
      label: 'Return first result',
      description:
        'The results will not be a list of results, it will just be the first result found.',
      inputType: 'switch',
      switchOptions: {
        checked: 'true',
        unchecked: 'false',
        defaultChecked: false,
      },
    },
  ];

  async run({ configValue }: RunActionArgs<ConfigValue>): Promise<Response> {
    const { text, query, returnFirstResult } = configValue;

    // Add the 'g' flag to search for all matches
    const expression = new RegExp(query, 'g');
    const matches = text.match(expression); // Get all matches

    if (!matches) {
      return { result: null }; // No match found
    }

    if (returnFirstResult === 'true') {
      return { result: matches[0] ?? null }; // Return first result
    } else {
      return { results: matches }; // Return all results
    }
  }

  async mockRun({
    configValue,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
    const { returnFirstResult } = configValue;

    if (returnFirstResult == 'true') {
      return { result: 'result 1' };
    } else {
      return { results: ['result 1', 'result 2'] };
    }
  }
}

type ConfigValue = z.infer<Search['aiSchema']>;

type Response =
  | {
      results: RegExpMatchArray | null;
    }
  | {
      result: string | null;
    };

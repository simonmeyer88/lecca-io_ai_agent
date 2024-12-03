import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { NodeViewOptions } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { List } from '../list.app';

export class CombineLists extends Action {
  app: List;
  id = 'list_action_combine-lists';
  name = 'Combine Lists';
  iconUrl: null | string =
    `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.app.id}.svg`;
  needsConnection = false;
  description = 'Combines multiple lists into a single list';
  viewOptions: null | NodeViewOptions = {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
      },
    },
  };
  aiSchema = z.object({
    listOfListItems: z
      .array(z.array(z.string()))
      .min(1)
      .describe('List of lists to combine'),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'listOfListItems',
      label: 'List Items',
      description:
        'Each item should be a string or a list of values. E.g. ["a", "b"], "c", ["d"] would become ["a", "b", "c", "d"]',
      inputType: 'text',
      occurenceType: 'multiple',
      required: {
        missingMessage: 'At least one list is required',
        missingStatus: 'warning',
      },
    },
  ];

  async run({ configValue }: RunActionArgs<ConfigValue>): Promise<Response> {
    const { listOfListItems } = configValue;

    // Validate and parse each item in listOfListItems
    const parsedItems =
      listOfListItems?.map((item) => {
        if (typeof item === 'string') {
          return this.app.parseJsonArrayOrValue(item);
        } else if (Array.isArray(item)) {
          return item;
        } else if (typeof item === 'number' || typeof item === 'string') {
          // Handle single values like numbers or strings
          return item;
        } else {
          throw new Error(
            'Each item must be either a JSON-stringified array, an array, or a single value (number or string).',
          );
        }
      }) ?? [];

    // Flatten all parsed lists and concatenate individual values
    const combinedList = parsedItems.flat() as any;

    return { result: combinedList };
  }

  async mockRun(): Promise<unknown> {
    return { result: ['a', 'b', 'c', 'd', 'e', 'f'] };
  }
}

type ConfigValue = z.infer<CombineLists['aiSchema']>;

type Response = {
  result: string[];
};

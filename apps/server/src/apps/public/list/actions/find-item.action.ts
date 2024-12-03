import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { NodeViewOptions } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { List } from '../list.app';

export class FindItemInList extends Action {
  app: List;
  id = 'list_action_find-item';
  name = 'Find Item in List';
  iconUrl: null | string =
    `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.app.id}.svg`;
  needsConnection = false;
  description =
    'Finds a specified item in a list of values and returns the item and its index';
  viewOptions: null | NodeViewOptions = {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
      },
    },
  };
  aiSchema = z.object({
    listOfItems: z
      .array(z.any())
      .describe('The list of items from which to find the value'),
    itemToFind: z.any().describe('The item to find in the list'),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'listOfItems',
      label: 'List',
      description:
        'Provide a list of items where the search will be performed.',
      inputType: 'text',
      required: {
        missingMessage: 'List is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'itemToFind',
      label: 'Item to Find',
      description: 'Provide the item to search for in the list.',
      inputType: 'text',
      required: {
        missingMessage: 'Item to find is required',
        missingStatus: 'warning',
      },
    },
  ];

  async run({ configValue }: RunActionArgs<ConfigValue>): Promise<Response> {
    const { listOfItems, itemToFind } = configValue;

    let list;
    // Validate and parse each item in listOfItems
    if (typeof listOfItems === 'string') {
      list = this.app.parseJsonArrayOrValue(listOfItems);
      if (!Array.isArray(list)) {
        throw new Error('List must be a valid JSON array');
      }
    } else if (Array.isArray(listOfItems)) {
      list = listOfItems;
    } else {
      throw new Error(
        'List must be a valid stringified JSON array or an array of values',
      );
    }

    // Find the index of the item
    const foundIndex = list.indexOf(itemToFind);

    // If the item is found, return the item and its index, else return null
    const foundItem = foundIndex !== -1 ? list[foundIndex] : null;

    return { result: foundItem, index: foundIndex !== -1 ? foundIndex : null };
  }

  async mockRun(): Promise<unknown> {
    return { result: 'found-item', index: 1 };
  }
}

type ConfigValue = z.infer<FindItemInList['aiSchema']>;

type Response = {
  result: unknown;
  index: number | null;
};

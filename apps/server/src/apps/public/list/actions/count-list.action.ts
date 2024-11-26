import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { NodeViewOptions } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { List } from '../list.app';

export class CountList extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: List;

  id() {
    return 'list_action_count';
  }

  name() {
    return 'Count list items';
  }

  iconUrl(): null | string {
    return `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.app.id}.svg`;
  }

  needsConnection(): boolean {
    return false;
  }

  description() {
    return 'Counts the number of items in a list';
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
      listOfItems: z
        .array(z.any())
        .describe('The list of items from which to find the value'),
    });
  }

  inputConfig(): InputConfig[] {
    return [
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
    ];
  }

  async run({ configValue }: RunActionArgs<ConfigValue>): Promise<Response> {
    const { listOfItems } = configValue;

    let list;
    // Validate and parse each item in listOfListItems
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

    return { result: list.length };
  }

  async mockRun(): Promise<unknown> {
    return { result: 2 };
  }
}

type ConfigValue = z.infer<ReturnType<CountList['aiSchema']>>;

type Response = {
  result: unknown;
};

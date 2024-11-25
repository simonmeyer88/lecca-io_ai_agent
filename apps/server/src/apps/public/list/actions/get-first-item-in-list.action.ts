import {
  Action,
  RunActionArgs,
  ActionConstructorArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { z } from 'zod';
import { NodeViewOptions } from '@/apps/lib/trigger';
import { List } from '../list.app';
import { ServerConfig } from '@/config/server.config';

export class GetFirstItemInList extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: List;

  id() {
    return 'list_action_get-first-item';
  }

  name() {
    return 'Get First Item in List';
  }

  iconUrl(): null | string {
    return `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.app.id}.svg`;
  }

  needsConnection(): boolean {
    return false;
  }

  description() {
    return 'Gets the first item from a list of values';
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
        .describe('The list of items from which to get the first item'),
    });
  }

  inputConfig(): InputConfig[] {
    return [
      {
        id: 'listOfItems',
        label: 'List',
        description:
          'Provide a list of items, and this action will return the first item.',
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

    // Get the first item in the list
    const firstItem = list[0] ?? null;

    return { result: firstItem };
  }

  async mockRun(): Promise<unknown> {
    return { result: 'first-item' };
  }
}

type ConfigValue = z.infer<ReturnType<GetFirstItemInList['aiSchema']>>;

type Response = {
  result: unknown;
};

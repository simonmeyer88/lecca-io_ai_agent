import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { Action } from '@/apps/lib/action';
import { Trigger } from '@/apps/lib/trigger';
import { Connection } from '@/apps/lib/connection';
import { CombineLists } from './actions/combine-lists.action';
import { GetLastItemInList } from './actions/get-last-item-in-list.action';
import { GetFirstItemInList } from './actions/get-first-item-in-list.action';
import { FindItemInList } from './actions/find-item.action';
import { CountList } from './actions/count-list.action';
import { ServerConfig } from '@/config/server.config';

export class List extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

  id = 'list';
  name = 'List Heper';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description = `List (Array) helper offered by ${ServerConfig.PLATFORM_NAME}`;
  isPublished = true;
  needsConnection = false;

  connections(): Connection[] {
    return [];
  }

  actions(): Action[] {
    return [
      new FindItemInList({ app: this }),
      new CombineLists({ app: this }),
      new GetLastItemInList({ app: this }),
      new GetFirstItemInList({ app: this }),
      new CountList({ app: this }),
    ];
  }

  triggers(): Trigger[] {
    return [];
  }

  // Helper function to check if a string is a valid JSON array or value
  parseJsonArrayOrValue = (item: string): unknown => {
    try {
      const parsed = JSON.parse(item);
      if (Array.isArray(parsed)) {
        return parsed;
      } else {
        // If it's not an array, return the parsed value (string, number, etc.)
        return parsed;
      }
    } catch {
      // If parsing fails, it's not valid JSON, return the item as is (it could be a single value string)
      return item;
    }
  };
}

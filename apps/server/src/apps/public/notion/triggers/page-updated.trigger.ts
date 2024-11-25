import { InputConfig } from '@/apps/lib/input-config';
import {
  RunTriggerArgs,
  TimeBasedPollTrigger,
  TriggerConstructorArgs,
} from '@/apps/lib/trigger';
import { Notion } from '../notion.app';
import { DateStringToMilliOrNull } from '@/apps/utils/date-string-to-milli-or-null';

export class PageUpdated extends TimeBasedPollTrigger {
  constructor(args: TriggerConstructorArgs) {
    super(args);
  }

  app: Notion;

  id() {
    return 'notion_trigger_page-updated';
  }

  name() {
    return 'Page Updated';
  }

  description() {
    return 'Triggers when any page is updated in the workspace.';
  }

  inputConfig(): InputConfig[] {
    // No need for database selection since this triggers on any page update.
    return [];
  }

  async run({ connection, testing }: RunTriggerArgs<unknown>): Promise<any[]> {
    const notionLib = this.app.notionLib({
      accessToken: connection.accessToken,
    });

    const response = await notionLib.search({
      filter: {
        property: 'object',
        value: 'page',
      },
      sort: {
        timestamp: 'last_edited_time',
        direction: 'descending',
      },
      page_size: testing ? 1 : 15,
    });

    const items = response.results.map((result: any) => {
      return {
        data: result,
      };
    });

    return items;
  }

  async mockRun(): Promise<any[]> {
    return [
      {
        data: {
          id: 'mock-page-id',
          object: 'page',
          created_time: '2023-10-01T00:00:00.000Z',
          last_edited_time: '2023-10-02T00:00:00.000Z',
        },
      },
    ];
  }

  extractTimestampFromResponse({ response }: { response: any }) {
    return DateStringToMilliOrNull(response.data.last_edited_time);
  }
}

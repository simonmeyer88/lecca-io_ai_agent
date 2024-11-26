import { Action } from '@/apps/lib/action';
import { Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { Trigger } from '@/apps/lib/trigger';
import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { ServerConfig } from '@/config/server.config';

import { GetDatasetItems } from './actions/get-dataset-items.action';
import { ListTasks } from './actions/list-tasks.action';
import { RunTask } from './actions/run-task.action';
import { ApifyApiKey } from './connections/apify.api-key';

export class Apify extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

  id = 'apify';
  name = 'Apify';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.png`;
  description = 'Cloud platform for web scraping and browser automation.';
  isPublished = true;

  connections(): Connection[] {
    return [new ApifyApiKey({ app: this })];
  }

  actions(): Action[] {
    return [
      new RunTask({ app: this }),
      new ListTasks({ app: this }),
      new GetDatasetItems({ app: this }),
    ];
  }

  triggers(): Trigger[] {
    return [];
  }

  dynamicListTasks(): InputConfig {
    return {
      id: 'taskId',
      label: 'Task',
      description: 'The ID of the Apify task to run',
      inputType: 'dynamic-select',
      _getDynamicValues: async ({ connection, workspaceId }) => {
        const url = `https://api.apify.com/v2/actor-tasks`;

        const result = await this.http.loggedRequest({
          method: 'GET',
          url,
          headers: {
            Authorization: `Bearer ${connection.apiKey}`,
          },
          workspaceId,
        });

        return (
          result.data?.data?.items?.map((item: any) => {
            return {
              value: item.id,
              label: item.name,
            };
          }) ?? []
        );
      },
    };
  }

  dynamicListTaskInputSchema(): InputConfig {
    return {
      id: 'schema',
      label: 'Input Schema Overrides',
      description:
        'The input schema fields you want to override for your task. If you do not enter a value for a property, the default schema value will be used.',
      occurenceType: 'dynamic',
      loadOptions: {
        dependsOn: [
          'taskId',
          {
            id: 'showSchemaMap',
            value: 'true',
          },
        ],
      },
      inputType: 'map',
      _getDynamicValues: async ({ connection, extraOptions, workspaceId }) => {
        const { taskId } = extraOptions;

        if (taskId == null) {
          throw new Error('Task ID is required to retrieve schema fields');
        }

        const url = `https://api.apify.com/v2/actor-tasks/${taskId}/input`;

        const result = await this.http.loggedRequest({
          method: 'GET',
          url,
          headers: {
            Authorization: `Bearer ${connection.apiKey}`,
          },
          workspaceId,
        });

        const schema = result?.data ?? {};

        return Object.keys(schema).map((key) => {
          return {
            label: key,
            value: key,
          };
        });
      },
    };
  }
}

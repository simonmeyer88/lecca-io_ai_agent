import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { Apify } from '../apify.app';
import { z } from 'zod';
import { NodeViewOptions } from '@/apps/lib/trigger';

export class GetDatasetItems extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Apify;
  id() {
    return 'apify_action_get-dataset-items';
  }
  name() {
    return 'Get Dataset Items';
  }
  description() {
    return 'Retrieves a dataset items';
  }
  viewOptions(): null | NodeViewOptions {
    return {
      saveButtonOptions: {
        replaceSaveAndTestButton: {
          label: 'Save & Test',
          type: 'real',
          tooltip: 'Save and execute the action to generate a real output.',
        },
      },
    };
  }
  aiSchema() {
    return z.object({
      datasetId: z.string(),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        id: 'datasetId',
        label: 'Dataset ID',
        inputType: 'text',
        description: 'The ID of the dataset to retrieve',
        required: {
          missingMessage: 'Dataset ID is required',
          missingStatus: 'warning',
        },
      },
    ];
  }

  async run({
    connection,
    configValue,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<any> {
    const { datasetId } = configValue;
    const url = `https://api.apify.com/v2/datasets/${datasetId}/items`;

    const result = await this.app.http.loggedRequest({
      method: 'GET',
      url,
      headers: {
        Authorization: `Bearer ${connection.apiKey}`,
      },
      workspaceId,
    });

    return { items: result.data ?? [] };
  }

  async mockRun(): Promise<unknown> {
    //There is no mock for this action
    return {};
  }
}

type ConfigValue = z.infer<ReturnType<GetDatasetItems['aiSchema']>>;

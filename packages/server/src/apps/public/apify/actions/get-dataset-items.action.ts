import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { NodeViewOptions } from '@/apps/lib/trigger';

import { Apify } from '../apify.app';

export class GetDatasetItems extends Action {
  app: Apify;
  id = 'apify_action_get-dataset-items';
  name = 'Get Dataset Items';
  description = 'Retrieves a dataset items';
  viewOptions: null | NodeViewOptions = {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
        tooltip: 'Save and execute the action to generate a real output.',
      },
    },
  };
  aiSchema = z.object({
    datasetId: z.string(),
  });
  inputConfig: InputConfig[] = [
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

type ConfigValue = z.infer<GetDatasetItems['aiSchema']>;

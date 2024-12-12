import { createAction } from '@lecca-io/toolkit';
import { createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const getDatasetItems = createAction({
  id: 'apify_action_get-dataset-items',
  name: 'Get Dataset Items',
  description: 'Retrieves a dataset items',
  inputConfig: [
    createTextInputField({
      id: 'datasetId',
      label: 'Dataset ID',
      description: 'The ID of the dataset to retrieve',
      required: {
        missingMessage: 'Dataset ID is required',
        missingStatus: 'warning',
      },
    }),
  ],
  aiSchema: z.object({
    datasetId: z.string(),
  }),
  viewOptions: {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
        tooltip: 'Save and execute the action to generate a real output.',
      },
    },
  },
  run: async ({ connection, configValue, workspaceId, http }): Promise<any> => {
    const { datasetId } = configValue;
    const url = `https://api.apify.com/v2/datasets/${datasetId}/items`;

    const result = await http.request({
      method: 'GET',
      url,
      headers: {
        Authorization: `Bearer ${connection?.apiKey}`,
      },
      workspaceId,
    });

    return { items: result.data ?? [] };
  },
  mockRun: async (): Promise<unknown> => {
    // There is no mock for this action
    return {};
  },
});

import { createTogetherAI } from '@ai-sdk/togetherai';
import { createDynamicSelectInputField } from '@lecca-io/toolkit';

export const shared = {
  fields: {
    dynamicSelectModel: createDynamicSelectInputField({
      label: 'Model',
      id: 'model',
      placeholder: 'Select model',
      description: 'The model to use for generating responses.',
      _getDynamicValues: async ({ connection, http, workspaceId }) => {
        const response = await http.request({
          method: 'GET',
          url: `https://api.together.xyz/v1/models`,
          headers: {
            Authorization: `Bearer ${connection.apiKey}`,
          },
          workspaceId,
        });

        return response.data
          .filter((model) => model.type === 'chat')
          .map((model) => ({
            label: model.display_name,
            value: model.id,
          }));
      },
      required: {
        missingMessage: 'Model is required',
        missingStatus: 'warning',
      },
    }),
  },
  togetherai: ({ apiKey }: { apiKey: string }) =>
    createTogetherAI({
      apiKey,
    }),
};

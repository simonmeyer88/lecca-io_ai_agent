import { createOpenAI } from '@ai-sdk/openai';
import { createDynamicSelectInputField } from '@lecca-io/toolkit';
import openai from 'openai';

export const shared = {
  fields: {
    dynamicSelectModel: createDynamicSelectInputField({
      label: 'Model',
      id: 'model',
      placeholder: 'Select model',
      description: 'The model to use for generating responses.',
      _getDynamicValues: async ({ connection }) => {
        const OPEN_AI = new openai({
          apiKey: connection.apiKey,
          maxRetries: 2,
          timeout: 60000,
        });

        const models = await OPEN_AI.models.list();

        return (
          models?.data?.map((model) => {
            return {
              value: model.id,
              label: model.id,
            };
          }) ?? []
        );
      },
      required: {
        missingMessage: 'Model is required',
        missingStatus: 'warning',
      },
    }),
  },
  openai: ({ apiKey }: { apiKey: string }) =>
    createOpenAI({
      apiKey,
    }),
};

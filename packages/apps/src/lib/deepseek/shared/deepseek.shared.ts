import { createDeepSeek } from '@ai-sdk/deepseek';
import { createSelectInputField } from '@lecca-io/toolkit';

export const shared = {
  fields: {
    dynamicSelectModel: createSelectInputField({
      label: 'Model',
      id: 'model',
      placeholder: 'Select model',
      description: 'The model to use for generating responses.',
      selectOptions: [
        {
          label: 'deepseek-chat',
          value: 'deepseek-chat',
        },
        {
          label: 'deepseek-reasoner',
          value: 'deepseek-reasoner',
        },
      ],
      required: {
        missingMessage: 'Model is required',
        missingStatus: 'warning',
      },
    }),
  },
  deepseek: ({ apiKey }: { apiKey: string }) =>
    createDeepSeek({
      apiKey,
    }),
};

import { createAnthropic } from '@ai-sdk/anthropic';
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
          label: 'claude-3-5-sonnet-latest',
          value: 'claude-3-5-sonnet-latest',
        },
        {
          label: 'claude-3-5-haiku-latest',
          value: 'claude-3-5-haiku-latest',
        },
        {
          label: 'claude-3-opus-latest',
          value: 'claude-3-opus-latest',
        },
        {
          label: 'claude-3-sonnet-20240229',
          value: 'claude-3-sonnet-20240229',
        },
        {
          label: 'claude-3-haiku-20240307',
          value: 'claude-3-haiku-20240307',
        },
      ],
      required: {
        missingMessage: 'Model is required',
        missingStatus: 'warning',
      },
    }),
  },
  anthropic: ({ apiKey }: { apiKey: string }) =>
    createAnthropic({
      apiKey,
    }),
};

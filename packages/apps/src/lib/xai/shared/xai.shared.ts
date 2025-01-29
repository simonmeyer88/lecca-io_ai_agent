import { createXai } from '@ai-sdk/xai';
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
          label: 'grok-2-1212',
          value: 'grok-2-1212',
        },
        {
          label: 'grok-2',
          value: 'grok-2',
        },
        {
          label: 'grok-2-latest',
          value: 'grok-2-latest',
        },
        {
          label: 'grok-2-vision-1212',
          value: 'grok-2-vision-1212',
        },
        {
          label: 'grok-2-vision',
          value: 'grok-2-vision',
        },
        {
          label: 'grok-2-vision-latest',
          value: 'grok-2-vision-latest',
        },
        {
          label: 'grok-beta',
          value: 'grok-beta',
        },
        {
          label: 'grok-vision-beta',
          value: 'grok-vision-beta',
        },
      ],
      required: {
        missingMessage: 'Model is required',
        missingStatus: 'warning',
      },
    }),
  },
  xai: ({ apiKey }: { apiKey: string }) =>
    createXai({
      apiKey,
    }),
};

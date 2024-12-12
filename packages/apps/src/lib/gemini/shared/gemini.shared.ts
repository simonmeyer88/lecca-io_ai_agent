import { createGoogleGenerativeAI } from '@ai-sdk/google';
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
          label: 'gemini-1.5-flash',
          value: 'gemini-1.5-flash',
        },
        {
          label: 'gemini-1.5-flash-8b',
          value: 'gemini-1.5-flash-8b',
        },
        {
          label: 'gemini-1.5-pro	',
          value: 'gemini-1.5-pro	',
        },
      ],
      required: {
        missingMessage: 'Model is required',
        missingStatus: 'warning',
      },
    }),
  },
  gemini: ({ apiKey }: { apiKey: string }) =>
    createGoogleGenerativeAI({
      apiKey,
    }),
};

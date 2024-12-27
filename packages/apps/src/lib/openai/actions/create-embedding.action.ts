import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/openai.shared';

export const createEmbedding = createAction({
  id: 'openai_action_create-embedding',
  name: 'Create Embedding',
  description: 'Create an embedding vector from input text',
  inputConfig: [
    shared.fields.dynamicSelectModel,
    createTextInputField({
      id: 'input',
      label: 'Text Input',
      description: 'The text to create embeddings for',
      required: {
        missingMessage: 'Text input is required',
        missingStatus: 'warning',
      },
      placeholder: 'Enter text',
    }),
  ],
  aiSchema: z.object({
    model: z.string().min(1).describe('The ID of the model to use'),
    input: z.string().min(1).describe('The text to create embeddings for'),
  }),
  run: async ({ configValue, connection, workspaceId, http }) => {
    const { model, input } = configValue;

    const result = await http.request({
      workspaceId,
      method: 'POST',
      url: 'https://api.openai.com/v1/embeddings',
      headers: {
        Authorization: `Bearer ${connection?.apiKey}`,
        'Content-Type': 'application/json',
      },
      data: {
        model,
        input,
      },
    });

    return {
      embedding: result.data.data[0].embedding,
      usage: result.data.usage,
    };
  },
  mockRun: async () => {
    return {
      embedding: new Array(1536).fill(0).map(() => Math.random() * 2 - 1),
      usage: {
        prompt_tokens: 8,
        total_tokens: 8,
      },
    };
  },
});

import {
  createAction,
  createSelectInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { generateText } from 'ai';
import { z } from 'zod';

import { shared } from '../shared/togetherai.shared';

export const chatFromText = createAction({
  id: 'togetherai_action_chat-from-text',
  name: 'Chat from Text',
  description: 'Chat with an AI model using text input',
  inputConfig: [
    shared.fields.dynamicSelectModel,
    {
      id: 'messages',
      occurenceType: 'multiple',
      label: 'Messages',
      description: 'One or more messages and roles sent to generate a response',
      inputConfig: [
        createSelectInputField({
          id: 'role',
          label: 'Role',
          description:
            'Role of the message sender. The model will use this information when generating a response.',
          hideCustomTab: true,
          selectOptions: [
            { value: 'user', label: 'User' },
            { value: 'system', label: 'System' },
            { value: 'assistant', label: 'Assistant' },
          ],
          required: {
            missingMessage: 'Role is required',
            missingStatus: 'warning',
          },
        }),
        createTextInputField({
          id: 'content',
          label: 'Content',
          description: 'One or more messages sent to generate a response',
          required: {
            missingMessage: 'Content is required',
            missingStatus: 'warning',
          },
        }),
      ],
    },
  ],
  aiSchema: z.object({
    model: z.string().min(1).describe('The ID of the model to use'),
    messages: z.array(
      z.object({
        role: z
          .enum(['user', 'system', 'assistant'])
          .describe('Role of the message sender'),
        content: z.string().min(1).describe('The content of the message'),
      }),
    ),
    maxTokens: z
      .number()
      .int()
      .positive()
      .describe('The maximum tokens')
      .nullable()
      .optional(),
  }),
  run: async ({ configValue, connection }) => {
    const togetherai = shared.togetherai({
      apiKey: connection.apiKey,
    });

    const { model, messages, maxTokens } = configValue;

    const run = await generateText({
      model: togetherai.completionModel(model),
      messages: messages as any,
      maxTokens,
    });

    return {
      response: run.text,
      usage: run.usage,
    };
  },
  mockRun: async () => {
    return {
      response: 'This is a mock response',
      usage: {
        completionTokens: 100,
        promptTokens: 100,
        totalTokens: 200,
      },
    };
  },
});

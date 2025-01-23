import {
  createAction,
  createNumberInputField,
  createSelectInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

export const createChatCompletion = createAction({
  id: 'perplexity_action_chat-completion',
  name: 'Create Chat Completion',
  description: 'Chat with Perplexity AI models using text input',
  inputConfig: [
    createSelectInputField({
      id: 'model',
      label: 'Model',
      description: 'The ID of the model to use',
      hideCustomTab: true,
      selectOptions: [
        {
          value: 'sonar-pro',
          label: 'Sonar Pro',
        },
        {
          value: 'sonar',
          label: 'Sonar',
        },
        {
          value: 'llama-3.1-sonar-small-128k-online',
          label: 'Sonar Small (8B)',
        },
        {
          value: 'llama-3.1-sonar-large-128k-online',
          label: 'Sonar Large (70B)',
        },
        {
          value: 'llama-3.1-sonar-huge-128k-online',
          label: 'Sonar Huge (405B)',
        },
      ],
      required: {
        missingMessage: 'Model is required',
        missingStatus: 'warning',
      },
    }),
    {
      id: 'messages',
      occurenceType: 'multiple',
      label: 'Messages',
      description: 'One or more messages and roles sent to generate a response',
      inputConfig: [
        createSelectInputField({
          id: 'role',
          label: 'Role',
          description: 'Role of the message sender',
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
          description: 'The content of the message',
          required: {
            missingMessage: 'Content is required',
            missingStatus: 'warning',
          },
        }),
      ],
    },
    createSelectInputField({
      id: 'search_recency_filter',
      label: 'Search Recency',
      description: 'Filter search results by time period',
      hideCustomTab: true,
      selectOptions: [
        { value: 'day', label: 'Day' },
        { value: 'week', label: 'Week' },
        { value: 'month', label: 'Month' },
        { value: 'year', label: 'Year' },
      ],
    }),
    createNumberInputField({
      id: 'max_tokens',
      label: 'Max Tokens',
      description: 'Maximum number of tokens to generate',
    }),
    createNumberInputField({
      id: 'temperature',
      label: 'Temperature',
      description: 'Controls randomness in the output (0-1)',
    }),
    createNumberInputField({
      id: 'top_p',
      label: 'Top P',
      description: 'Controls diversity of the output (0-1)',
    }),
    createNumberInputField({
      id: 'presence_penalty',
      label: 'Presence Penalty',
      description: 'Penalize new tokens based on presence in text',
    }),
    createNumberInputField({
      id: 'frequency_penalty',
      label: 'Frequency Penalty',
      description: 'Penalize new tokens based on frequency in text',
    }),
    createNumberInputField({
      id: 'top_k',
      label: 'Top K',
      description: 'Top K tokens to consider',
    }),
  ],
  aiSchema: z.object({
    model: z
      .enum([
        'llama-3.1-sonar-small-128k-online',
        'llama-3.1-sonar-large-128k-online',
        'llama-3.1-sonar-huge-128k-online',
      ])
      .describe('The ID of the model to use'),
    messages: z.array(
      z.object({
        role: z
          .enum(['user', 'system', 'assistant'])
          .describe('Role of the message sender'),
        content: z.string().min(1).describe('The content of the message'),
      }),
    ),
    max_tokens: z
      .number()
      .int()
      .positive()
      .optional()
      .describe('Maximum number of tokens to generate'),
    temperature: z
      .number()
      .min(0)
      .max(1)
      .optional()
      .describe('Controls randomness in the output'),
    top_p: z
      .number()
      .min(0)
      .max(1)
      .optional()
      .describe('Controls diversity of the output'),
    search_recency_filter: z
      .enum(['day', 'week', 'month', 'year'])
      .optional()
      .describe('Filter search results by time period'),
    presence_penalty: z
      .number()
      .optional()
      .describe('Penalize new tokens based on presence in text'),
    frequency_penalty: z
      .number()
      .optional()
      .describe('Penalize new tokens based on frequency in text'),
    top_k: z.number().optional(),
  }),
  run: async ({ configValue, connection, http, workspaceId }) => {
    const apiUrl = 'https://api.perplexity.ai/chat/completions';

    const requestBody = {
      ...configValue,
    };

    const response = await http.request({
      url: apiUrl,
      method: 'POST',
      headers: {
        Authorization: `Bearer ${connection.apiKey}`,
      },
      data: requestBody,
      workspaceId,
    });

    const data = response.data;

    return data;
  },
  mockRun: async () => {
    return {
      choices: {
        index: 0,
        finish_reason: 'stop',
        message: [
          {
            content: 'This is a mock response from Perplexity AI.',
            role: 'assistant',
          },
        ],
      },
      usage: {
        prompt_tokens: 14,
        completion_tokens: 70,
        total_tokens: 84,
      },
      citations: [
        'https://example.com/citation1',
        'https://example.com/citation2',
      ],
      id: 'mock-response-id',
      created: Math.floor(Date.now() / 1000),
      model: 'llama-3.1-sonar-small-128k-online',
    };
  },
});

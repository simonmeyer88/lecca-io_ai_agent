import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { generateObject, jsonSchema } from 'ai';
import { z } from 'zod';

import { shared } from '../shared/ai.shared';

export const decideWithAi = createAction({
  id: 'ai_action_decide-with-ai',
  name: 'Decide with AI',
  description:
    'Allow an AI model to select an option based on the data and instructions provided.',
  iconUrl: `https://lecca-io.s3.us-east-2.amazonaws.com/assets/actions/ai_action_decide-with-ai.svg`,
  inputConfig: [
    shared.fields.dynamicSelectAiProvider,
    shared.fields.dynamicSelectLlmModel,
    shared.fields.dynamicSelectLlmConnection,
    createTextInputField({
      id: 'instructions',
      label: 'Decision Instructions',
      description: 'How the AI should select an option.',
      placeholder: 'Add instructions',
      required: {
        missingMessage: 'Instructions are required',
        missingStatus: 'warning',
      },
    }),
    createTextInputField({
      id: 'options',
      label: 'Options',
      description: 'An option AI can select.',
      placeholder: 'Add an option, e.g. True',
      occurenceType: 'multiple',
      required: {
        missingMessage: 'Option is required',
        missingStatus: 'warning',
      },
    }),
  ],

  aiSchema: z.object({
    provider: z.string().describe('The AI provider to use'),
    model: z.string().describe('The ID of the model to use'),
    instructions: z
      .string()
      .describe('Instructions on how to select an option'),
    options: z.array(z.string()).describe('An option AI can select'),
  }),

  run: async ({
    configValue,
    workspaceId,
    projectId,
    agentId,
    executionId,
    workflowId,
    credits,
    aiProviders,
    prisma,
  }) => {
    const { model, instructions, options, provider } = configValue;

    //AI can't select connectionId
    const { __internal__llmConnectionId } = configValue as any;

    const { aiProviderClient, isUsingWorkspaceLlmConnection } =
      await shared.getAiProviderClient({
        connectionId: __internal__llmConnectionId,
        workspaceId,
        projectId,
        provider,
        model,
        aiProviders,
        prisma,
      });

    if (!isUsingWorkspaceLlmConnection) {
      await credits.checkIfWorkspaceHasLlmCredits({
        workspaceId,
        aiProvider: provider,
        model,
      });
    }

    const fullInstructions = `Instructions to select an option: ${instructions}. Please respond in JSON format.`;

    const { object, usage } = await generateObject({
      messages: [
        {
          role: 'system',
          content: fullInstructions,
        },
      ],
      model: aiProviderClient,
      mode: 'json',
      schema: jsonSchema({
        type: 'object',
        properties: {
          selectedOption: {
            type: 'string',
            enum: options,
            description: 'The option selected by the AI model.',
          },
        },
        additionalProperties: false,
        required: ['selectedOption'],
      }),
    });

    if (!isUsingWorkspaceLlmConnection) {
      const calculatedCreditsFromToken = credits.transformLlmTokensToCredits({
        aiProvider: provider,
        model,
        data: {
          inputTokens: usage.promptTokens,
          outputTokens: usage.completionTokens,
        },
      });

      await credits.updateWorkspaceCredits({
        workspaceId,
        creditsUsed: calculatedCreditsFromToken,
        projectId,
        data: {
          ref: {
            agentId,
            executionId,
            workflowId,
          },
          details: {
            actionId: 'ai_action_decide-with-ai',
            aiProvider: provider,
            llmModel: model,
            usage,
          },
        },
      });
    }

    return {
      response: object,
      usage,
    };
  },

  mockRun: async () => {
    return {
      response: 'Mock Response',
      usage: {
        completionTokens: 100,
        promptTokens: 100,
        totalTokens: 200,
      },
    };
  },
});

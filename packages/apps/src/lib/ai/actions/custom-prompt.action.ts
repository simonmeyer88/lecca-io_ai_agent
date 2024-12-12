import { createAction } from '@lecca-io/toolkit';
import { generateText } from 'ai';
import { z } from 'zod';

import { shared } from '../shared/ai.shared';

export const customPrompt = createAction({
  id: 'ai_action_custom-prompt',
  name: 'Custom Prompt',
  description: 'Prompt an AI model with custom messages',
  iconUrl: `https://lecca-io.s3.us-east-2.amazonaws.com/assets/actions/ai_action_custom-prompt.svg`,
  inputConfig: [
    shared.fields.dynamicSelectAiProvider,
    shared.fields.dynamicSelectLlmModel,
    shared.fields.dynamicSelectLlmConnection,
    {
      id: 'messages',
      occurenceType: 'multiple',
      label: 'Messages',
      description: 'One or more messages and roles sent to generate a response',
      inputConfig: [
        {
          id: 'role',
          label: 'Role',
          inputType: 'select',
          description:
            'Role of the message sender. The model will use this information when generating a response.',
          selectOptions: [
            { value: 'user', label: 'User' },
            { value: 'system', label: 'System' },
            { value: 'assistant', label: 'Assistant' },
          ],
          required: {
            missingMessage: 'Role is required',
            missingStatus: 'warning',
          },
        },
        {
          id: 'content',
          label: 'Content',
          inputType: 'text',
          description: 'One or more messages sent to generate a response',
          required: {
            missingMessage: 'Content is required',
            missingStatus: 'warning',
          },
        },
      ],
    },
  ],
  aiSchema: z.object({
    provider: z.string().describe('The AI provider to use'),
    model: z.string().describe('The ID of the model to use'),
    messages: z.array(
      z.object({
        role: z
          .enum(['user', 'system', 'assistant'])
          .describe('Role of the message sender'),
        content: z.string().min(1).describe('The content of the message'),
      }),
    ),
  }),
  run: async ({
    configValue,
    workspaceId,
    projectId,
    agentId,
    executionId,
    workflowId,
    credits,
    prisma,
    aiProviders,
  }) => {
    const { model, messages, provider } = configValue;

    //AI can't choose the llmConnection
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

    const { text, usage } = await generateText({
      model: aiProviderClient,
      messages: messages as any,
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
            actionId: 'ai_action_custom-prompt',
            aiProvider: provider,
            llmModel: model,
            usage: usage,
          },
        },
      });
    }

    return {
      response: text,
      usage: usage,
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

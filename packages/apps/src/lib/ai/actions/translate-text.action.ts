import {
  createAction,
  createSelectInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { generateText } from 'ai';
import { z } from 'zod';

import { shared } from '../shared/ai.shared';

export const translateText = createAction({
  id: 'ai_action_translate-text',
  name: 'Translate Text',
  description: 'Translate text to another language using AI',
  iconUrl: `https://lecca-io.s3.us-east-2.amazonaws.com/assets/actions/ai_action_translate-text.svg`,
  needsConnection: false,
  inputConfig: [
    shared.fields.dynamicSelectAiProvider,
    shared.fields.dynamicSelectLlmModel,
    shared.fields.dynamicSelectLlmConnection,
    createSelectInputField({
      id: 'language',
      label: 'Language',
      description: 'The language to translate to',
      selectOptions: shared.languages,
      required: {
        missingMessage: 'Language is required',
        missingStatus: 'warning',
      },
    }),
    createTextInputField({
      id: 'textToTranslate',
      label: 'Text to Translate',
      description: 'The text to translate',
      placeholder: 'Enter text to translate',
      required: {
        missingMessage: 'Text to translate is required',
        missingStatus: 'warning',
      },
    }),
  ],
  aiSchema: z.object({
    provider: z.string().describe('The AI provider to use'),
    model: z.string().describe('The ID of the model to use'),
    language: z.string().describe('The language to translate to'),
    textToTranslate: z.string().describe('The text to translate'),
  }),
  run: async ({
    configValue,
    workspaceId,
    projectId,
    agentId,
    executionId,
    workflowId,
    aiProviders,
    prisma,
    credits,
  }) => {
    const { model, textToTranslate, language, provider } = configValue;

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

    const { text, usage } = await generateText({
      model: aiProviderClient,
      messages: [
        {
          role: 'system',
          content: `You translate the entered text to ${language}`,
        },
        {
          role: 'user',
          content: textToTranslate,
        },
      ],
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
            actionId: 'ai_action_translate-text',
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

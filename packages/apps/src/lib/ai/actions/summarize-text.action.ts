import {
  createAction,
  createSelectInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { generateText } from 'ai';
import { z } from 'zod';

import { shared } from '../shared/ai.shared';

export const summarizeText = createAction({
  id: 'ai_action_summarize-text',
  name: 'Summarize Text',
  description: 'Summarizes text',
  iconUrl: `https://lecca-io.s3.us-east-2.amazonaws.com/assets/actions/ai_action_summarize-text.svg`,
  inputConfig: [
    shared.fields.dynamicSelectAiProvider,
    shared.fields.dynamicSelectLlmModel,
    shared.fields.dynamicSelectLlmConnection,
    createTextInputField({
      id: 'textToSummarize',
      label: 'Text to summarize',
      description: 'The text to summarize',
      placeholder: 'Enter text to summarize',
      required: {
        missingMessage: 'Text to summarize is required',
        missingStatus: 'warning',
      },
    }),
    createSelectInputField({
      id: 'summaryLength',
      label: 'Summary length',
      description: 'Select the length of the summary',
      defaultValue: 'a single paragraph',
      selectOptions: [
        { label: 'A short sentence', value: 'a short sentence' },
        { label: 'A few sentences', value: 'a few sentences' },
        { label: 'A single paragraph', value: 'a single paragraph' },
        { label: 'A few paragraphs', value: 'a few paragraphs' },
      ],
      required: {
        missingMessage: 'Summary length is required',
        missingStatus: 'warning',
      },
    }),
  ],

  aiSchema: z.object({
    provider: z.string().describe('The AI provider to use'),
    model: z.string().describe('The ID of the model to use'),
    textToSummarize: z.string().min(1).describe('The text to summarize'),
    summaryLength: z
      .enum([
        'a short sentence',
        'a few sentences',
        'a single paragraph',
        'a few paragraphs',
      ])
      .describe('The length of the summary'),
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
    const { model, provider, textToSummarize, summaryLength } = configValue;

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
          content: `You summarize the entered text to ${summaryLength}`,
        },
        {
          role: 'user',
          content: textToSummarize,
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
            actionId: 'ai_action_summarize-text',
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

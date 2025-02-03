import { createAction, createMarkdownField } from '@lecca-io/toolkit';
import { createTextInputField } from '@lecca-io/toolkit';
import { generateObject, jsonSchema } from 'ai';
import { z } from 'zod';

import { shared } from '../shared/ai.shared';

export const extractWithAi = createAction({
  id: 'ai_action_extract-with-ai',
  name: 'Extract with AI',
  description: 'Use an AI model to extract specific fields from provided text.',
  iconUrl: `https://lecca-io.s3.us-east-2.amazonaws.com/assets/actions/ai_action_extract-with-ai.svg`,
  inputConfig: [
    shared.fields.dynamicSelectAiProvider,
    shared.fields.dynamicSelectLlmModel,
    shared.fields.dynamicSelectLlmConnection,
    createTextInputField({
      id: 'textToAnalyze',
      label: 'Data to Analyze',
      description: 'The data to extract fields from.',
      placeholder: 'Add data',
      required: {
        missingMessage: 'Text to analyze is required',
        missingStatus: 'warning',
      },
    }),
    createTextInputField({
      id: 'fieldsToExtract',
      label: 'Fields to Extract',
      description: 'Add the name of the field to extract',
      placeholder: 'Add field name',
      occurenceType: 'multiple',
      required: {
        missingMessage: 'At least one field is required',
        missingStatus: 'warning',
      },
    }),
    createTextInputField({
      id: 'instructions',
      label: 'Additional Instructions',
      description: '',
      placeholder: 'Add custom instructions',
    }),
    createMarkdownField({
      id: 'markdown',
      markdown:
        "Not all models can extract data. We've tested the OpenAI models and determined those work best.",
    }),
  ],

  aiSchema: z.object({
    provider: z.string().describe('The AI provider to use'),
    model: z.string().describe('The ID of the model to use'),
    textToAnalyze: z.string().describe('Text to extract data from'),
    fieldsToExtract: z
      .array(z.string().describe('Name of the field to extract'))
      .describe('List of fields to extract with instructions'),
    instructions: z
      .string()
      .nullable()
      .optional()
      .describe('Text to extract data from'),
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
    const { model, provider, textToAnalyze, fieldsToExtract, instructions } =
      configValue;

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

    let fullInstructions =
      'Extract the following fields from the provided text in JSON format';
    fullInstructions += fieldsToExtract.map((field) => `${field}`).join('\n');
    fullInstructions += instructions
      ? `\n\nAdditional instructions: ${instructions}`
      : '';

    const { object, usage } = await generateObject({
      model: aiProviderClient,
      messages: [
        {
          role: 'system',
          content: `${fullInstructions}`,
        },
        {
          role: 'user',
          content: textToAnalyze,
        },
      ],
      schema: jsonSchema({
        type: 'object',
        properties: fieldsToExtract.reduce(
          (acc, field) => ({
            ...acc,
            [field]: {
              type: 'string',
              description: `The value extracted for ${field}`,
            },
          }),
          {},
        ),
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
            actionId: 'ai_action_extract-with-ai',
            aiProvider: provider,
            llmModel: model,
            usage: usage,
          },
        },
      });
    }

    return {
      response: object,
      usage: usage,
    };
  },

  mockRun: async ({ configValue }) => {
    const mockExtractedValues = configValue.fieldsToExtract.reduce(
      (acc, field) => ({
        ...acc,
        [field]: `Mock value for ${field}`,
      }),
      {} as Record<string, string>,
    );

    return {
      response: mockExtractedValues,
      usage: {
        completionTokens: 100,
        promptTokens: 100,
        totalTokens: 200,
      },
    };
  },
});

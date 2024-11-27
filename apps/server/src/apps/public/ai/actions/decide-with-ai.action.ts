import { LanguageModelUsage, generateObject, jsonSchema } from 'ai';
import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';
import { AiProvider } from '@/modules/global/ai-provider/ai-provider.service';

import { AI } from '../ai.app';

export class DecideWithAI extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: AI;
  id = 'ai_action_decide-with-ai';
  needsConnection = false;
  name = 'Decide with AI';
  iconUrl: null | string =
    `${ServerConfig.INTEGRATION_ICON_BASE_URL}/actions/${this.id}.svg`;
  description =
    'Allow an AI model to select an option based on the data and instructions provided.';
  aiSchema = z.object({
    provider: z.string().describe('The AI provider to use'),
    model: z.string().describe('The ID of the model to use'),
    instructions: z
      .string()
      .min(1)
      .describe('Instructions on how to select an option'),
    options: z.array(z.string().min(1)).describe('An option AI can select'),
  });
  inputConfig: InputConfig[] = [
    this.app.dynamicSelectAiProvider(),
    this.app.dynamicSelectLlmModel(),
    this.app.dynamicSelectLlmConnection(),
    {
      id: 'instructions',
      label: 'Decision Instructions',
      description: 'How the AI should select an option.',
      inputType: 'text',
      placeholder: 'Add instructions',
      required: {
        missingMessage: 'Instructions are required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'options',
      label: 'Options',
      description: 'An option AI can select.',
      placeholder: 'Add an option, e.g. True',
      inputType: 'text',
      occurenceType: 'multiple',
      required: {
        missingMessage: 'Option is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'markdown',
      description: '',
      label: '',
      markdown:
        "Not all models can extract data. We've tested the OpenAI models and determined those work best.",
      inputType: 'markdown',
    },
  ];

  async run({
    configValue,
    workspaceId,
    projectId,
    agentId,
    executionId,
    workflowId,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
    const {
      model,
      instructions,
      options,
      provider,
      __internal__llmConnectionId,
    } = configValue;

    const { aiProviderClient, isUsingWorkspaceLlmConnection } =
      await this.app.getAiProviderClient({
        connectionId: __internal__llmConnectionId,
        workspaceId,
        projectId,
        provider,
        model,
      });

    if (!isUsingWorkspaceLlmConnection) {
      await this.app.credits.checkIfWorkspaceHasLlmCredits({
        workspaceId,
        aiProvider: provider as AiProvider,
        model,
      });
    }

    // Construct a prompt that clearly states the options available
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
      const calculatedCreditsFromToken =
        this.app.credits.transformLlmTokensToCredits({
          aiProvider: provider as AiProvider,
          model,
          data: {
            inputTokens: usage.promptTokens,
            outputTokens: usage.completionTokens,
          },
        });

      await this.app.credits.updateWorkspaceCredits({
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
            actionId: this.id,
            aiProvider: provider,
            llmModel: model,
            usage: usage,
          },
        },
      });
    }

    return {
      response: object as any,
      usage: usage,
    };
  }

  async mockRun(): Promise<Response> {
    return {
      response: 'Mock Response',
      usage: {
        completionTokens: 100,
        promptTokens: 100,
        totalTokens: 200,
      },
    };
  }
}

type ConfigValue = z.infer<DecideWithAI['aiSchema']> & {
  __internal__llmConnectionId?: string;
};

type Response = {
  response: string;
  usage: LanguageModelUsage;
};

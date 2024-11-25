import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { z } from 'zod';
import { AI } from '../ai.app';
import { ServerConfig } from '@/config/server.config';
import { generateObject, jsonSchema, LanguageModelUsage } from 'ai';
import { AiProvider } from '@/modules/global/ai-provider/ai-provider.service';

export class ExtractWithAI extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: AI;
  id() {
    return 'ai_action_extract-with-ai';
  }
  needsConnection() {
    return false;
  }
  name() {
    return 'Extract with AI';
  }
  iconUrl(): null | string {
    return `${ServerConfig.INTEGRATION_ICON_BASE_URL}/actions/${this.id()}.svg`;
  }
  description() {
    return 'Use an AI model to extract specific fields from provided text.';
  }

  aiSchema() {
    return z.object({
      provider: z.string().describe('The AI provider to use'),
      model: z.string().describe('The ID of the model to use'),
      textToAnalyze: z.string().min(1).describe('Text to extract data from'),
      fieldsToExtract: z
        .array(z.string().min(1).describe('Name of the field to extract'))
        .describe('List of fields to extract with instructions'),
      instructions: z
        .string()
        .nullable()
        .optional()
        .describe('Text to extract data from'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      this.app.dynamicSelectAiProvider(),
      this.app.dynamicSelectLlmModel(),
      this.app.dynamicSelectLlmConnection(),
      {
        id: 'textToAnalyze',
        label: 'Data to Analyze',
        description: 'The data to extract fields from.',
        inputType: 'text',
        placeholder: 'Add data',
        required: {
          missingMessage: 'Text to analyze is required',
          missingStatus: 'warning',
        },
      },
      {
        id: 'fieldsToExtract',
        label: 'Fields to Extract',
        description: 'Add the name of the field to extract',
        inputType: 'text',
        placeholder: 'Add field name',
        occurenceType: 'multiple', // Allow user to add multiple fields
        required: {
          missingMessage: 'At least one field is required',
          missingStatus: 'warning',
        },
      },
      {
        id: 'instructions',
        label: 'Additional Instructions',
        description: '',
        inputType: 'text',
        placeholder: 'Add custom instructions',
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
  }

  async run({
    configValue,
    workspaceId,
    projectId,
    agentId,
    executionId,
    workflowId,
  }: RunActionArgs<ConfigValue>): Promise<PromptResponse> {
    const {
      model,
      provider,
      textToAnalyze,
      fieldsToExtract,
      instructions,
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
            actionId: this.id(),
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

  async mockRun(args: RunActionArgs<ConfigValue>): Promise<PromptResponse> {
    const mockExtractedValues = args.configValue.fieldsToExtract.reduce(
      (acc: any, field: any) => ({
        ...acc,
        [field]: `Mock value for ${field}`,
      }),
      {} as any,
    );

    return {
      response: mockExtractedValues,
      usage: {
        completionTokens: 100,
        promptTokens: 100,
        totalTokens: 200,
      },
    };
  }
}

type ConfigValue = z.infer<ReturnType<ExtractWithAI['aiSchema']>> & {
  __internal__llmConnectionId?: string;
};

type PromptResponse = {
  response: Record<string, string>;
  usage: LanguageModelUsage;
};

import { LanguageModelUsage, generateText } from 'ai';
import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';
import { AiProvider } from '@/modules/global/ai-provider/ai-provider.service';

import { AI } from '../ai.app';

export class CustomPrompt extends Action {
  app: AI;
  id = 'ai_action_custom-prompt';
  needsConnection = false;
  name = 'Custom Prompt';
  iconUrl: null | string =
    `${ServerConfig.INTEGRATION_ICON_BASE_URL}/actions/${this.id}.svg`;
  description = 'Prompt an AI model with custom messages';
  aiSchema = z.object({
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
  });
  inputConfig: InputConfig[] = [
    this.app.dynamicSelectAiProvider(),
    this.app.dynamicSelectLlmModel(),
    this.app.dynamicSelectLlmConnection(),
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
            {
              value: 'user',
              label: 'User',
            },
            {
              value: 'system',
              label: 'System',
            },
            {
              value: 'assistant',
              label: 'Assistant',
            },
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
  ];

  async run({
    configValue,
    workspaceId,
    projectId,
    agentId,
    executionId,
    workflowId,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
    const { model, messages, provider, __internal__llmConnectionId } =
      configValue;

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

    const { text, usage } = await generateText({
      model: aiProviderClient,
      messages: messages as any,
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
      response: text,
      usage: usage,
    };
  }

  async mockRun(): Promise<Response> {
    return {
      response: 'This is a mock response',
      usage: {
        completionTokens: 100,
        promptTokens: 100,
        totalTokens: 200,
      },
    };
  }
}

type ConfigValue = z.infer<CustomPrompt['aiSchema']> & {
  __internal__llmConnectionId?: string;
};

type Response = {
  response: string;
  usage: LanguageModelUsage;
};

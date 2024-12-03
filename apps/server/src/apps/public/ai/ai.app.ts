import { LanguageModelV1 } from 'ai';

import { Action } from '@/apps/lib/action';
import { App } from '@/apps/lib/app';
import { Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { Trigger } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';
import { AiProvider } from '@/modules/global/ai-provider/ai-provider.service';

import { CustomPrompt } from './actions/custom-prompt.action';
import { DecideWithAI } from './actions/decide-with-ai.action';
import { ExtractWithAI } from './actions/extract-with-ai.action';
import { ListAgents } from './actions/list-agents.action';
import { MessageAgent } from './actions/message-agent.action';
import { SummarizeText } from './actions/summarize-text.action';
import { TranslateText } from './actions/translate-text.action';

export class AI extends App {
  id = 'ai';
  name = 'AI';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description = `AI actions offered by ${ServerConfig.PLATFORM_NAME}`;
  isPublished = Object.keys(this.aiProviders.providers).length > 0;
  needsConnection = false;

  connections(): Connection[] {
    return [];
  }

  actions(): Action[] {
    return [
      new MessageAgent({ app: this }),
      new ExtractWithAI({ app: this }),
      new DecideWithAI({ app: this }),
      new CustomPrompt({ app: this }),
      new TranslateText({ app: this }),
      new SummarizeText({ app: this }),
      new ListAgents({ app: this }),
    ];
  }

  triggers(): Trigger[] {
    return [];
  }

  dynamicSelectAiProvider(): InputConfig {
    return {
      label: 'AI Provider',
      id: 'provider',
      inputType: 'select',
      placeholder: 'Select provider',
      hideCustomTab: true,
      selectOptions: Object.keys(this.aiProviders.providers).map(
        (provider) => ({
          value: provider,
          label: provider,
        }),
      ),
      description: 'The AI provider to use for generating responses.',
      defaultValue: ServerConfig.OPENAI_API_KEY ? 'openai' : undefined,
      required: {
        missingMessage: 'Provider is required',
        missingStatus: 'warning',
      },
    };
  }

  dynamicSelectLlmModel(): InputConfig {
    return {
      label: 'Model',
      id: 'model',
      inputType: 'dynamic-select',
      placeholder: 'Select model',
      hideCustomTab: true,
      loadOptions: {
        forceRefresh: true,
        dependsOn: ['provider'],
      },
      defaultValue: ServerConfig.OPENAI_API_KEY ? 'gpt-4o-mini' : undefined,
      description: 'The model to use for generating responses.',
      _getDynamicValues: async ({ extraOptions }) => {
        const { provider } = extraOptions;
        if (!provider) {
          throw new Error('Provider is required before selecting a model');
        }

        const models =
          this.aiProviders.providers[provider as AiProvider].languageModels ??
          {};

        return Object.keys(models).map((model) => ({
          value: model,
          label: model,
        }));
      },
      required: {
        missingMessage: 'Model is required',
        missingStatus: 'warning',
      },
    };
  }

  dynamicSelectLlmConnection(): InputConfig {
    return {
      label: 'API Key',
      id: '__internal__llmConnectionId',
      inputType: 'dynamic-select',
      placeholder: 'Select connection',
      loadOptions: {
        forceRefresh: true,
        dependsOn: ['provider'],
      },
      hideCustomTab: true,
      description:
        'Use your own connection credentials for this AI Provider. Select "Use Platform" to use the platform credits.',
      selectOptions: [
        {
          value: 'credits',
          label: 'Use Platform Credits',
        },
      ],
      _getDynamicValues: async ({ projectId, workspaceId, extraOptions }) => {
        const { provider } = extraOptions;
        const appConnectionId =
          this.aiProviders.providers[provider as AiProvider]?.appConnectionId;

        const connections = await this.prisma.connection.findMany({
          where: {
            AND: [
              {
                FK_workspaceId: workspaceId,
              },
              {
                connectionId: appConnectionId,
              },
              {
                OR: [
                  {
                    FK_projectId: projectId,
                  },
                  {
                    FK_projectId: null,
                  },
                ],
              },
            ],
          },
          select: {
            id: true,
            name: true,
          },
        });

        return connections.map((c) => ({
          label: c.name,
          value: c.id,
        }));
      },
      required: {
        missingMessage: 'Agent is required',
        missingStatus: 'warning',
      },
    };
  }

  async getAiProviderClient({
    workspaceId,
    projectId,
    provider,
    model,
    connectionId,
  }: {
    workspaceId: string;
    projectId: string;
    provider: string;
    model: string;
    connectionId: string | undefined;
  }): Promise<{
    aiProviderClient: LanguageModelV1;
    /**
     * This means that the workspace setup a llm model, so we won't use the platform credits.
     */
    isUsingWorkspaceLlmConnection: boolean;
  }> {
    let llmConnection:
      | { id: string; apiKey: string; connectionId: string }
      | undefined;

    if (connectionId && connectionId !== 'credits') {
      const projectHasAccessToConnection =
        await this.prisma.connection.findFirst({
          where: {
            AND: [
              {
                FK_workspaceId: workspaceId,
              },
              {
                id: connectionId,
              },
              {
                OR: [
                  {
                    FK_projectId: projectId,
                  },
                  {
                    FK_projectId: null,
                  },
                ],
              },
            ],
          },
          select: {
            id: true,
            connectionId: true,
          },
        });

      if (!projectHasAccessToConnection) {
        throw new Error('Project does not have access to the connection');
      }

      const appConnectionId =
        this.aiProviders.providers[provider as AiProvider]?.appConnectionId;

      if (projectHasAccessToConnection.connectionId !== appConnectionId) {
        throw new Error('Connection is not the correct AI Provider type');
      }

      llmConnection = await this.prisma.connection.findUnique({
        where: {
          id: connectionId,
        },
        select: {
          id: true,
          apiKey: true,
          connectionId: true,
        },
      });
    }

    const aiProviderClient = this.aiProviders.getAiLlmProviderClient({
      aiProvider: provider as AiProvider,
      llmConnection,
      llmModel: model,
      workspaceId,
    });

    return {
      aiProviderClient: aiProviderClient,
      isUsingWorkspaceLlmConnection: !!llmConnection,
    };
  }
}

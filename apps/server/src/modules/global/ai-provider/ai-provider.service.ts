import { createAnthropic } from '@ai-sdk/anthropic';
import { createGoogleGenerativeAI } from '@ai-sdk/google';
import { createOpenAI } from '@ai-sdk/openai';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Connection } from '@prisma/client';
import { EmbeddingModel, LanguageModelV1 } from 'ai';
import { createOllama } from 'ollama-ai-provider';

import { ServerConfig } from '@/config/server.config';

import { CryptoService } from '../crypto/crypto.service';

import { DEFAULT_PROVIDERS } from './ai-provider-defaults';
import {
  getOllamaModelsWithDetails,
  ollamaIsRunning,
} from './utils/ollama-utils';

@Injectable()
export class AiProviderService {
  constructor(private cryptoService: CryptoService) {
    this.providers = {
      ...DEFAULT_PROVIDERS,
    };

    Object.keys(this.providers).forEach((provider: AiProvider) => {
      switch (provider) {
        case 'openai':
          if (!ServerConfig.OPENAI_API_KEY) {
            delete this.providers[provider];
          }
          break;
        case 'anthropic':
          if (!ServerConfig.ANTHROPIC_API_KEY) {
            delete this.providers[provider];
          }
          break;
        case 'ollama':
          ollamaIsRunning().then((isRunning) => {
            if (isRunning) {
              getOllamaModelsWithDetails().then((models) => {
                models.forEach((model) => {
                  this.providers.ollama.languageModels[model.model] = {
                    //Just going to assume true for vision and tools for now.
                    vision: true,
                    tools: true,
                    canStreamText: true,
                    //Ollama does not support streaming tools.
                    //Even with the ollama-ai-provider I couldn't really get it to work.
                    canStreamTools: false,
                    creditConversionData: {
                      //This doesn't really matter, since it's only on local host at the moment.
                      //And credits are not being used locally for the community.
                      input: 4000,
                      output: 1000,
                    },
                  };
                });
              });
            } else {
              delete this.providers.ollama;
            }
          });
          break;
        case 'gemini':
          if (!ServerConfig.GEMINI_API_KEY) {
            delete this.providers[provider];
          }
          break;
        default:
          throw new BadRequestException(
            `You forgot to check if ${provider} provider is available in AI Provider constructor`,
          );
      }
    });
  }

  providers: AiProviders;

  getAiProviderClient = ({
    aiProvider,
    llmModel,
    llmConnection,
    workspaceId,
  }: {
    aiProvider: AiProvider;
    llmModel: string;
    llmConnection:
      | Pick<Connection, 'id' | 'apiKey' | 'connectionId'>
      | undefined;
    workspaceId: string;
  }): LanguageModelV1 => {
    if (!llmModel) {
      throw new BadRequestException('LLM Model is required');
    }

    if (!aiProvider) {
      throw new BadRequestException('AI Provider is required');
    }

    let apiKey: string | null;
    if (llmConnection) {
      //We'll use their model and api key if they have it.

      if (!llmConnection.apiKey) {
        throw new BadRequestException(
          'The LLM Connection does not contain an API key',
        );
      }

      this.decryptCredentials({
        data: llmConnection,
      });

      apiKey = llmConnection.apiKey;
    } else {
      //We'll use our own model and api key if they don't have it. (We'll use their credits)
      switch (aiProvider) {
        case 'openai':
          apiKey = ServerConfig.OPENAI_API_KEY;
          break;
        case 'anthropic':
          apiKey = ServerConfig.ANTHROPIC_API_KEY;
          break;
        case 'gemini':
          apiKey = ServerConfig.GEMINI_API_KEY;
          break;
        case 'ollama':
          apiKey = null;
          break;
        default:
          throw new BadRequestException(
            `The ${aiProvider} AI Provider is not supported for LLM`,
          );
      }
    }

    switch (aiProvider) {
      case 'openai':
        return createOpenAI({
          compatibility: 'strict', //Use `compatible` - when using 3rd party providers. but stream options won't exist
          apiKey,
        })(llmModel, {
          user: workspaceId,
        });
      case 'anthropic':
        return createAnthropic({
          apiKey,
        })(llmModel);
      case 'gemini':
        return createGoogleGenerativeAI({
          apiKey,
        })(llmModel, {
          structuredOutputs: false,
        });
      case 'ollama': {
        return createOllama({
          baseURL: ServerConfig.OLLAMA_BASE_URL,
        })(llmModel, {
          experimentalStreamTools: false,
        });
      }
    }
  };

  getAiLlmProviderClient = ({
    aiProvider,
    llmModel,
    llmConnection,
    workspaceId,
  }: {
    aiProvider: AiProvider;
    llmModel: string;
    llmConnection:
      | Pick<Connection, 'id' | 'apiKey' | 'connectionId'>
      | undefined;
    workspaceId: string;
  }): LanguageModelV1 => {
    if (!llmModel) {
      throw new BadRequestException('LLM Model is required');
    }

    if (!aiProvider) {
      throw new BadRequestException('AI Provider is required');
    }

    let apiKey: string | null;
    if (llmConnection) {
      //We'll use their model and api key if they have it.

      if (!llmConnection.apiKey) {
        throw new BadRequestException(
          'The LLM Connection does not contain an API key',
        );
      }

      this.decryptCredentials({
        data: llmConnection,
      });

      apiKey = llmConnection.apiKey;
    } else {
      //We'll use our own model and api key if they don't have it. (We'll use their credits)
      switch (aiProvider) {
        case 'openai':
          apiKey = ServerConfig.OPENAI_API_KEY;
          break;
        case 'anthropic':
          apiKey = ServerConfig.ANTHROPIC_API_KEY;
          break;
        case 'gemini':
          apiKey = ServerConfig.GEMINI_API_KEY;
          break;
        case 'ollama':
          apiKey = null;
          break;
        default:
          throw new BadRequestException(
            `The ${aiProvider} AI Provider is not supported for LLM`,
          );
      }
    }

    switch (aiProvider) {
      case 'openai':
        return createOpenAI({
          compatibility: 'strict', //Use `compatible` - when using 3rd party providers. but stream options won't exist
          apiKey,
        })(llmModel, {
          user: workspaceId,
        });
      case 'anthropic':
        return createAnthropic({
          apiKey,
        })(llmModel);
      case 'gemini':
        return createGoogleGenerativeAI({
          apiKey,
        })(llmModel, {
          structuredOutputs: false,
        });
      case 'ollama': {
        return createOllama({
          baseURL: ServerConfig.OLLAMA_BASE_URL,
        })(llmModel, {
          experimentalStreamTools: true,
        });
      }
    }
  };

  getAiEmbeddingProviderClient = ({
    aiProvider,
    embeddingModel,
    llmConnection,
    workspaceId,
    requestedDimensionSize,
  }: {
    aiProvider: AiProvider;
    embeddingModel: string;
    llmConnection:
      | Pick<Connection, 'id' | 'apiKey' | 'connectionId'>
      | undefined;
    workspaceId: string;
    requestedDimensionSize: number;
  }): EmbeddingModel<string> => {
    if (!embeddingModel) {
      throw new BadRequestException('Embedding Model is required');
    }

    if (!aiProvider) {
      throw new BadRequestException('AI Provider is required');
    }

    let apiKey: string | null;
    if (llmConnection) {
      //We'll use their model and api key if they have it.

      if (!llmConnection.apiKey) {
        throw new BadRequestException(
          'The LLM Connection does not contain an API key',
        );
      }

      this.decryptCredentials({
        data: llmConnection,
      });

      apiKey = llmConnection.apiKey;
    } else {
      //We'll use our own model and api key if they don't have it. (We'll use their credits)
      switch (aiProvider) {
        case 'openai':
          apiKey = ServerConfig.OPENAI_EMBEDDING_API_KEY;
          break;
        case 'ollama':
          apiKey = null;
          break;
        default:
          throw new BadRequestException(
            `The ${aiProvider} AI Provider is not supported for Embedding`,
          );
      }
    }

    const embeddingModelData = this.getEmbeddingModelData({
      aiProvider,
      modelName: embeddingModel,
    });

    const allowsCustomDim = embeddingModelData.dimensionOptions.allowsCustomDim;
    const defaultDimensionSize = embeddingModelData.dimensionOptions.defaultDim;

    if (!allowsCustomDim) {
      if (defaultDimensionSize !== requestedDimensionSize) {
        throw new BadRequestException(
          `The requested dimension size for this knowledge notebook is ${requestedDimensionSize}. That dimension size is not supported for model ${embeddingModel}. The default dimension size for model ${embeddingModel} is ${defaultDimensionSize} and cannot be customized.`,
        );
      }
    } else {
      if (
        requestedDimensionSize <
          embeddingModelData.dimensionOptions.minCustomDim ||
        requestedDimensionSize >
          embeddingModelData.dimensionOptions.maxCustomDim
      ) {
        throw new BadRequestException(
          `The requested dimension size for this knowledge notebook is ${requestedDimensionSize}. That dimension size is not supported for model ${embeddingModel}. The supported dimension sizes for model ${embeddingModel} are between ${embeddingModelData.dimensionOptions.minCustomDim} and ${embeddingModelData.dimensionOptions.maxCustomDim}.`,
        );
      }
    }

    switch (aiProvider) {
      case 'openai':
        return createOpenAI({
          compatibility: 'strict', //Use `compatible` - when using 3rd party providers. but stream options won't exist
          apiKey,
        }).textEmbeddingModel(embeddingModel, {
          dimensions: allowsCustomDim ? requestedDimensionSize : undefined,
          user: workspaceId,
        });
      case 'ollama': {
        return createOllama({
          baseURL: ServerConfig.OLLAMA_BASE_URL,
        }).textEmbeddingModel(embeddingModel);
      }
    }
  };

  getEmbeddingModelData = ({
    aiProvider,
    modelName,
  }: {
    aiProvider: AiProvider;
    modelName: string;
  }) => {
    if (!modelName) {
      throw new BadRequestException('Model name is required');
    }

    if (!aiProvider) {
      throw new BadRequestException('AI Provider is required');
    }

    return this.providers[aiProvider]?.embeddingModels[modelName];
  };

  getLanguageModelData = ({
    aiProvider,
    modelName,
  }: {
    aiProvider: AiProvider;
    modelName: string;
  }) => {
    if (!modelName) {
      throw new BadRequestException('Model name is required');
    }

    if (!aiProvider) {
      throw new BadRequestException('AI Provider is required');
    }

    return this.providers[aiProvider]?.languageModels[modelName];
  };

  decryptCredentials({ data }: { data: Partial<Connection> }) {
    try {
      if (data.accessToken) {
        data.accessToken = this.cryptoService.decrypt(data.accessToken);
      }

      if (data.refreshToken) {
        data.refreshToken = this.cryptoService.decrypt(data.refreshToken);
      }

      if (data.apiKey) {
        data.apiKey = this.cryptoService.decrypt(data.apiKey);
      }

      if (data.username) {
        data.username = this.cryptoService.decrypt(data.username);
      }

      if (data.password) {
        data.password = this.cryptoService.decrypt(data.password);
      }

      if (data.privateKey) {
        data.privateKey = this.cryptoService.decrypt(data.privateKey);
      }

      if (data.publicKey) {
        data.publicKey = this.cryptoService.decrypt(data.publicKey);
      }
    } catch {
      throw new ForbiddenException('Invalid credentials');
    }
  }
}

export type AiProvider = 'openai' | 'ollama' | 'anthropic' | 'gemini';

export type AiProviders = {
  [key in AiProvider]: AiProviderData;
};

export type AiProviderData = {
  appConnectionId: string | null;
  languageModels: { [key: string]: AiLanguageModelData };
  embeddingModels: { [key: string]: AiEmbeddingModelData };
};

export type AiLanguageModelData = {
  canStreamText: boolean;
  canStreamTools: boolean;
  vision: boolean;
  tools: boolean;
  creditConversionData: {
    input: number;
    output: number;
  };
};

export type AiEmbeddingModelData = {
  creditConversionData: {
    perEmbedding: number;
  };
  dimensionOptions: {
    /**
     * If default dimension is unknown, we will try the
     * dimension size of the knowledge notebook dimension size
     * if the allowsCustomDim property is true.
     */
    defaultDim: number | undefined;
    allowsCustomDim: boolean;
    minCustomDim: number | null;
    maxCustomDim: number | null;
  };
};

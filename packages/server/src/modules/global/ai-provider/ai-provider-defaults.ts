import { AiProviders } from './ai-provider.service';

export const DEFAULT_PROVIDERS: AiProviders = {
  openai: {
    appConnectionId: 'openai_connection_api-key',
    languageModels: {
      'gpt-4o': {
        vision: true,
        tools: true,
        canStreamText: true,
        canStreamTools: true,
        creditConversionData: {
          input: 240,
          output: 60,
        },
      },
      'gpt-4o-mini': {
        vision: true,
        tools: true,
        canStreamText: true,
        canStreamTools: true,
        creditConversionData: {
          input: 4000,
          output: 1000,
        },
      },
    },
    embeddingModels: {
      'text-embedding-ada-002': {
        creditConversionData: {
          perEmbedding: 0.1,
        },
        dimensionOptions: {
          defaultDim: 1536,
          allowsCustomDim: false,
          maxCustomDim: null,
          minCustomDim: null,
        },
      },
      'text-embedding-3-large': {
        creditConversionData: {
          perEmbedding: 0.2,
        },
        dimensionOptions: {
          defaultDim: 512,
          allowsCustomDim: true,
          maxCustomDim: 3072,
          minCustomDim: 0,
        },
      },
      'text-embedding-3-small': {
        creditConversionData: {
          perEmbedding: 0.1,
        },
        dimensionOptions: {
          defaultDim: 1024,
          allowsCustomDim: true,
          maxCustomDim: 1536,
          minCustomDim: 0,
        },
      },
    },
  },
  anthropic: {
    appConnectionId: 'anthropic_connection_api-key',
    languageModels: {
      'claude-3-5-sonnet-latest': {
        vision: true,
        tools: true,
        canStreamText: true,
        canStreamTools: true,
        creditConversionData: {
          input: 200,
          output: 40,
        },
        //8192 output
      },
      'claude-3-5-haiku-latest': {
        vision: false,
        tools: true,
        canStreamText: true,
        canStreamTools: true,
        creditConversionData: {
          //1 third of sonnet
          input: 120,
          output: 600,
        },
        //8192 output
      },
      'claude-3-opus-latest': {
        vision: true,
        tools: true,
        canStreamText: true,
        canStreamTools: true,
        creditConversionData: {
          input: 8,
          output: 40,
        },
        //4096
      },
      'claude-3-haiku-20240307': {
        vision: true,
        tools: true,
        canStreamText: true,
        canStreamTools: true,
        creditConversionData: {
          input: 2400,
          output: 480,
        },
      },
    },
    embeddingModels: {},
  },
  gemini: {
    appConnectionId: 'gemini_connection_api-key',
    languageModels: {
      'gemini-1.5-flash': {
        vision: true,
        tools: false,
        canStreamText: true,
        canStreamTools: false,
        creditConversionData: {
          input: 4000,
          output: 1000,
        },
        //8192 output
      },
      'gemini-1.5-pro': {
        vision: true,
        tools: true,
        canStreamText: true,
        canStreamTools: true,
        creditConversionData: {
          input: 240,
          output: 60,
        },
        //8192 output
      },
    },
    embeddingModels: {},
  },
  ollama: {
    appConnectionId: null,
    languageModels: {
      // Will be set at runtime
    },
    embeddingModels: {
      // Will be set at runtime
    },
  },
};

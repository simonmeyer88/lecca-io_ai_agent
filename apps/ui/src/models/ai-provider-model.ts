export type AiProvider = 'openai' | 'ollama';

export type AiProviders = Partial<{
  [key in AiProvider]: AiProviderData;
}>;

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
};

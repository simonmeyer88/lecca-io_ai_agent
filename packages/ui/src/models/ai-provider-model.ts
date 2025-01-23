export type AiProvider =
  | 'openai'
  | 'ollama'
  | 'gemini'
  | 'anthropic'
  | 'together-ai'
  | 'perplexity'
  | 'huggingface';

export type AiProviders = Partial<{
  [key in AiProvider]: AiProviderData;
}>;

export type AiProviderData = {
  appConnectionId: string | null;
  languageModels: { [key: string]: AiLanguageModelData };
  embeddingModels: { [key: string]: AiEmbeddingModelData };
  platformCredentialsEnabled: boolean;
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

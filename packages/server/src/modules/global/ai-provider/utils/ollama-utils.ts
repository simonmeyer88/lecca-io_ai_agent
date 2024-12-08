import axios from 'axios';

import { ServerConfig } from '@/config/server.config';

export async function getOllamaModelsWithDetails(): Promise<OllamaModel[]> {
  try {
    if (!ServerConfig.OLLAMA_BASE_URL) {
      return [];
    }

    const response = await axios.get(`${ServerConfig.OLLAMA_BASE_URL}/tags`);
    return response.data.models || [];
  } catch (error) {
    console.error('Error fetching Ollama models:', error);
    return [];
  }
}

export async function ollamaIsRunning(): Promise<boolean> {
  try {
    if (!ServerConfig.OLLAMA_BASE_URL) {
      return false;
    }

    await axios.get(`${ServerConfig.OLLAMA_BASE_URL}/tags`);
    return true;
  } catch {
    return false;
  }
}

type OllamaModel = Partial<{
  name: string;
  model: string;
  modified_at: string;
  size: number;
  digest: string;
  details: Partial<{
    parent_model: string;
    format: string;
    family: string;
    famililes: string[];
    parameter_size: string;
    quantization_level: string;
  }>;
}>;

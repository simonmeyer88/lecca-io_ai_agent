import { createGoogleGenerativeAI } from '@ai-sdk/google';

import { Action } from '@/apps/lib/action';
import { Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { Trigger } from '@/apps/lib/trigger';
import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { ServerConfig } from '@/config/server.config';

import { ChatFromText } from './actions/chat-from-text.action';
import { GeminiApiKey } from './connections/gemini.api-key';

export class Gemini extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

  id = 'gemini';
  name = 'Gemini';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description =
    'Gemini provides powerfuls AI models that can be used to generate human-like text.';
  isPublished = true;
  connections(): Connection[] {
    return [new GeminiApiKey({ app: this })];
  }
  actions(): Action[] {
    return [new ChatFromText({ app: this })];
  }
  triggers(): Trigger[] {
    return [];
  }

  gemini({ apiKey }: { apiKey: string }) {
    return createGoogleGenerativeAI({
      apiKey,
    });
  }

  dynamicSelectModel(): InputConfig {
    return {
      label: 'Model',
      id: 'model',
      inputType: 'select',
      placeholder: 'Select model',
      description: 'The model to use for generating responses.',
      selectOptions: [
        {
          label: 'gemini-1.5-flash',
          value: 'gemini-1.5-flash',
        },
        {
          label: 'gemini-1.5-flash-8b',
          value: 'gemini-1.5-flash-8b',
        },
        {
          label: 'gemini-1.5-pro	',
          value: 'gemini-1.5-pro	',
        },
      ],
      required: {
        missingMessage: 'Model is required',
        missingStatus: 'warning',
      },
    };
  }
}

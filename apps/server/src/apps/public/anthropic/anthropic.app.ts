import { createAnthropic } from '@ai-sdk/anthropic';

import { Action } from '@/apps/lib/action';
import { App, AppContructorArgs } from '@/apps/lib/app';
import { Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { Trigger } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { ChatFromText } from './actions/chat-from-text.action';
import { AnthropicApiKey } from './connections/anthropic.api-key';

export class Anthropic extends App {
  constructor(args: AppContructorArgs) {
    super(args);
  }

  id = 'anthropic';
  name = 'Anthropic Claude';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description =
    'Anthropic provides a powerful AI model, Claude, that can be used to generate human-like text.';
  isPublished = true;
  connections(): Connection[] {
    return [new AnthropicApiKey({ app: this })];
  }
  actions(): Action[] {
    return [new ChatFromText({ app: this })];
  }
  triggers(): Trigger[] {
    return [];
  }

  anthropic({ apiKey }: { apiKey: string }) {
    return createAnthropic({
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
          label: 'claude-3-5-sonnet-latest',
          value: 'claude-3-5-sonnet-latest',
        },
        {
          label: 'claude-3-5-haiku-latest',
          value: 'claude-3-5-haiku-latest',
        },
        {
          label: 'claude-3-opus-latest',
          value: 'claude-3-opus-latest',
        },
        {
          label: 'claude-3-sonnet-20240229',
          value: 'claude-3-sonnet-20240229',
        },
        {
          label: 'claude-3-haiku-20240307',
          value: 'claude-3-haiku-20240307',
        },
      ],
      required: {
        missingMessage: 'Model is required',
        missingStatus: 'warning',
      },
    };
  }
}

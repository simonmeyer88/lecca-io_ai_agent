import { LanguageModelUsage, generateText } from 'ai';
import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';
import { AiProvider } from '@/modules/global/ai-provider/ai-provider.service';

import { AI } from '../ai.app';

export class TranslateText extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: AI;
  id() {
    return 'ai_action_translate-text';
  }
  needsConnection() {
    return false;
  }
  name() {
    return 'Translate Text';
  }
  iconUrl(): null | string {
    return `${ServerConfig.INTEGRATION_ICON_BASE_URL}/actions/${this.id()}.svg`;
  }
  description() {
    return 'Translate text to another language using AI';
  }

  aiSchema() {
    return z.object({
      provider: z.string().describe('The AI provider to use'),
      model: z.string().describe('The ID of the model to use'),
      language: z.string().min(1).describe('The language to translate to'),
      textToTranslate: z.string().min(1).describe('The text to translate'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      this.app.dynamicSelectAiProvider(),
      this.app.dynamicSelectLlmModel(),
      this.app.dynamicSelectLlmConnection(),
      {
        id: 'language',
        description: 'The language to translate to',
        inputType: 'select',
        selectOptions: languages,
        label: 'Language',
        required: {
          missingMessage: 'Language is required',
          missingStatus: 'warning',
        },
      },
      {
        id: 'textToTranslate',
        description: 'The text to translate',
        inputType: 'text',
        label: 'Text to Translate',
        required: {
          missingMessage: 'Text to translate is required',
          missingStatus: 'warning',
        },
        placeholder: 'Enter text to translate',
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
      textToTranslate,
      language,
      provider,
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

    const { text, usage } = await generateText({
      model: aiProviderClient,
      messages: [
        {
          role: 'system',
          content: `You translate the entered text to ${language}`,
        },
        {
          role: 'user',
          content: textToTranslate,
        },
      ],
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
      response: text,
      usage: usage,
    };
  }

  async mockRun(): Promise<PromptResponse> {
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

type ConfigValue = z.infer<ReturnType<TranslateText['aiSchema']>> & {
  __internal__llmConnectionId?: string;
};

type PromptResponse = {
  response: string;
  usage: LanguageModelUsage;
};

const languages = [
  { value: 'Albanian', label: 'Albanian' },
  { value: 'Amharic', label: 'Amharic' },
  { value: 'Arabic', label: 'Arabic' },
  { value: 'Armenian', label: 'Armenian' },
  { value: 'Bengali', label: 'Bengali' },
  { value: 'Bosnian', label: 'Bosnian' },
  { value: 'Bulgarian', label: 'Bulgarian' },
  { value: 'Burmese', label: 'Burmese' },
  { value: 'Catalan', label: 'Catalan' },
  { value: 'Chinese', label: 'Chinese' },
  { value: 'Croatian', label: 'Croatian' },
  { value: 'Czech', label: 'Czech' },
  { value: 'Danish', label: 'Danish' },
  { value: 'Dutch', label: 'Dutch' },
  { value: 'Estonian', label: 'Estonian' },
  { value: 'Finnish', label: 'Finnish' },
  { value: 'French', label: 'French' },
  { value: 'Georgian', label: 'Georgian' },
  { value: 'German', label: 'German' },
  { value: 'Greek', label: 'Greek' },
  { value: 'Gujarati', label: 'Gujarati' },
  { value: 'Hindi', label: 'Hindi' },
  { value: 'Hungarian', label: 'Hungarian' },
  { value: 'Icelandic', label: 'Icelandic' },
  { value: 'Indonesian', label: 'Indonesian' },
  { value: 'Italian', label: 'Italian' },
  { value: 'Japanese', label: 'Japanese' },
  { value: 'Kannada', label: 'Kannada' },
  { value: 'Kazakh', label: 'Kazakh' },
  { value: 'Korean', label: 'Korean' },
  { value: 'Latvian', label: 'Latvian' },
  { value: 'Lithuanian', label: 'Lithuanian' },
  { value: 'Macedonian', label: 'Macedonian' },
  { value: 'Malay', label: 'Malay' },
  { value: 'Malayalam', label: 'Malayalam' },
  { value: 'Marathi', label: 'Marathi' },
  { value: 'Mongolian', label: 'Mongolian' },
  { value: 'Norwegian', label: 'Norwegian' },
  { value: 'Persian', label: 'Persian' },
  { value: 'Polish', label: 'Polish' },
  { value: 'Portuguese', label: 'Portuguese' },
  { value: 'Punjabi', label: 'Punjabi' },
  { value: 'Romanian', label: 'Romanian' },
  { value: 'Russian', label: 'Russian' },
  { value: 'Serbian', label: 'Serbian' },
  { value: 'Slovak', label: 'Slovak' },
  { value: 'Slovenian', label: 'Slovenian' },
  { value: 'Somali', label: 'Somali' },
  { value: 'Spanish', label: 'Spanish' },
  { value: 'Swahili', label: 'Swahili' },
  { value: 'Swedish', label: 'Swedish' },
  { value: 'Tagalog', label: 'Tagalog' },
  { value: 'Tamil', label: 'Tamil' },
  { value: 'Telugu', label: 'Telugu' },
  { value: 'Thai', label: 'Thai' },
  { value: 'Turkish', label: 'Turkish' },
  { value: 'Ukrainian', label: 'Ukrainian' },
  { value: 'Urdu', label: 'Urdu' },
  { value: 'Vietnamese', label: 'Vietnamese' },
];

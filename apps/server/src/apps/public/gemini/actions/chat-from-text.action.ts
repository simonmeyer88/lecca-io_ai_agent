import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { z } from 'zod';
import { Gemini } from '../gemini.app';
import { generateText, LanguageModelUsage } from 'ai';

export class ChatFromText extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Gemini;
  id() {
    return 'gemini_action_chat-from-text';
  }
  name() {
    return 'Chat from Text';
  }
  description() {
    return 'Chat with an AI model using text input';
  }
  aiSchema() {
    return z.object({
      model: z.string().min(1).describe('The ID of the model to use'),
      messages: z.array(
        z.object({
          role: z
            .enum(['user', 'system', 'assistant'])
            .describe('Role of the message sender'),
          content: z.string().min(1).describe('The content of the message'),
        }),
      ),
      maxTokens: z
        .number()
        .int()
        .positive()
        .describe('The maximum tokens')
        .nullable()
        .optional(),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      this.app.dynamicSelectModel(),
      {
        id: 'messages',
        occurenceType: 'multiple',
        label: 'Messages',
        description:
          'One or more messages and roles sent to generate a response',
        inputConfig: [
          {
            id: 'role',
            label: 'Role',
            inputType: 'select',
            description:
              'Role of the message sender. The model will use this information when generating a response.',
            hideCustomTab: true,
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
  }

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<ChatResponse> {
    const anthropic = this.app.gemini({
      apiKey: connection.apiKey,
    });

    const { model, messages, maxTokens } = configValue;

    const run = await generateText({
      model: anthropic.languageModel(model),
      messages: messages as any,
      maxTokens,
    });

    return {
      response: run.text,
      usage: run.usage,
    };
  }

  async mockRun(): Promise<ChatResponse> {
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

type ConfigValue = z.infer<ReturnType<ChatFromText['aiSchema']>>;

type ChatResponse = {
  response: string;
  usage: LanguageModelUsage;
};

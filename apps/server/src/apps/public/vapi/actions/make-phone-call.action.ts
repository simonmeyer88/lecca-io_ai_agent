import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { Vapi } from '../vapi.app';

export class MakePhoneCall extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Vapi;
  id() {
    return 'vapi_action_make-phone-call';
  }
  name() {
    return 'Make Phone Call';
  }
  description() {
    return 'Start a phone call for selected voice agent';
  }
  aiSchema() {
    return z.object({
      name: z.string().optional().describe('Name to reference call'),
      vapiAssistantId: z
        .string()
        .min(1)
        .describe('The ID of the vapi assistant to use'),
      vapiPhoneNumberId: z
        .string()
        .min(1)
        .describe('The ID of the vapi phone number to use'),
      customerPhoneNumber: z
        .string()
        .min(1)
        .describe(
          'The phone number to call, including the county and area code e.g. +18019999999',
        ),
      assistantOverrides: z.any().nullable().optional(),
      waitForFinish: z
        .enum(['true', 'false'])
        .nullable()
        .optional()
        .describe('Wait for the call to finish before returning result?'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        id: 'name',
        inputType: 'text',
        description: 'For your own reference',
        label: 'Name',
        placeholder: 'Enter a name',
      },
      this.app.dynamicSelectVapiAssistants(),
      this.app.dynamicSelectVapiPhoneNumbers(),
      {
        id: 'customerPhoneNumber',
        inputType: 'text',
        description:
          'The phone number to call. Must include country and area code.',
        label: 'Phone Number to Call',
        placeholder: 'Enter full phone number, e.g. +18019999999',
        required: {
          missingMessage: 'Phone number is required',
          missingStatus: 'warning',
        },
      },
      {
        id: 'assistantOverrides',
        inputType: 'json',
        description:
          'Go to https://docs.vapi.ai/api-reference/calls/create-call to learn more.',
        label: 'Assistant Overrides',
        placeholder: 'Enter assistant overrides as JSON',
      },
      {
        id: 'waitForFinish',
        inputType: 'switch',
        switchOptions: {
          checked: 'true',
          defaultChecked: true,
          unchecked: 'false',
        },
        description:
          'Wait for call to finish before returning result? Maximum wait time is 5 minutes.',
        label: 'Wait for Call to Finish',
      },
    ];
  }

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
    const url = 'https://api.vapi.ai/call';

    // Fetch the list of VAPI assistants using HTTP GET
    const result = await this.app.http.loggedRequest({
      method: 'POST',
      url,
      data: {
        name: configValue.name || undefined,
        assistantId: configValue.vapiAssistantId,
        phoneNumberId: configValue.vapiPhoneNumberId,
        customer: {
          number: configValue.customerPhoneNumber,
        },
        assistantOverrides: configValue.assistantOverrides || undefined,
        // assistantOverrides: {
        //   firstMessage:
        //     "Hello! I am Dan, you're personal assistant. How can I help you today?",
        //   // systemPrompt: 'Only speak spanish',
        // },
      },
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${connection.apiKey}`,
      },
      workspaceId,
    });

    if (configValue.waitForFinish === 'true') {
      const maxPolls = 20;
      const pollIntervalInSeconds = 15;

      let polls = 0;

      await new Promise((resolve) => setTimeout(resolve, 5000));

      while (polls < maxPolls) {
        const callUrl = `https://api.vapi.ai/call/${result.data.id}`;
        const callResult = await this.app.http.loggedRequest({
          method: 'GET',
          url: callUrl,
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${connection.apiKey}`,
          },
          workspaceId,
        });

        if (callResult.data.status === 'ended') {
          return {
            result: callResult.data,
          } as any;
        }

        await new Promise((resolve) =>
          setTimeout(resolve, pollIntervalInSeconds * 1000),
        );
        polls++;
      }
    } else {
      return {
        result: result.data,
      } as any;
    }
  }

  async mockRun(args: RunActionArgs<ConfigValue>): Promise<Response> {
    if (args.configValue.waitForFinish === 'false') {
      return mockDontWait as any;
    } else {
      return mock;
    }
  }
}

const mock = {
  type: 'outboundPhoneCall',
  messages: [
    {
      role: '<string>',
      message: '<string>',
      time: 123,
      endTime: 123,
      secondsFromStart: 123,
      duration: 123,
    },
  ],
  phoneCallProvider: 'twilio',
  phoneCallTransport: 'sip',
  status: 'queued',
  endedReason: 'assistant-error',
  destination: {
    type: 'number',
    numberE164CheckEnabled: true,
    number: '<string>',
    extension: '<string>',
    message: '<string>',
    description: '<string>',
  },
  id: '<string>',
  orgId: '<string>',
  createdAt: '2023-11-07T05:31:56Z',
  updatedAt: '2023-11-07T05:31:56Z',
  startedAt: '2023-11-07T05:31:56Z',
  endedAt: '2023-11-07T05:31:56Z',
  cost: 123,
  costBreakdown: {
    transport: 123,
    stt: 123,
    llm: 123,
    tts: 123,
    vapi: 123,
    total: 123,
    llmPromptTokens: 123,
    llmCompletionTokens: 123,
    ttsCharacters: 123,
    analysisCostBreakdown: {
      summary: 123,
      summaryPromptTokens: 123,
      summaryCompletionTokens: 123,
      structuredData: 123,
      structuredDataPromptTokens: 123,
      structuredDataCompletionTokens: 123,
      successEvaluation: 123,
      successEvaluationPromptTokens: 123,
      successEvaluationCompletionTokens: 123,
    },
  },
  costs: [{}],
  transcript: '<string>',
  recordingUrl: '<string>',
  stereoRecordingUrl: '<string>',
  artifact: {
    messages: [
      {
        role: '<string>',
        message: '<string>',
        time: 123,
        endTime: 123,
        secondsFromStart: 123,
        duration: 123,
      },
    ],
    messagesOpenAIFormatted: [
      {
        content: '<string>',
        role: 'assistant',
      },
    ],
    videoRecordingUrl: '<string>',
    videoRecordingStartDelaySeconds: 123,
  },
  artifactPlan: {
    videoRecordingEnabled: true,
    recordingS3PathPrefix: '<string>',
  },
  analysis: {
    summary: '<string>',
    structuredData: {},
    successEvaluation: '<string>',
  },
  phoneCallProviderId: '<string>',
  assistantId: '<string>',
  assistant: {
    transcriber: {
      provider: 'deepgram',
      model: 'nova-2',
      language: 'bg',
      smartFormat: false,
      keywords: ['<string>'],
      endpointing: 255,
    },
    model: {
      messages: [
        {
          content: '<string>',
          role: 'assistant',
        },
      ],
      tools: [
        {
          async: false,
          messages: [
            {
              type: 'request-start',
              content: '<string>',
              conditions: [
                {
                  value: '<string>',
                  operator: 'eq',
                  param: '<string>',
                },
              ],
            },
          ],
          type: 'dtmf',
          function: {
            name: '<string>',
            description: '<string>',
            parameters: {
              type: 'object',
              properties: {},
              required: ['<string>'],
            },
          },
          server: {
            timeoutSeconds: 20,
            url: '<string>',
            secret: '<string>',
          },
        },
      ],
      toolIds: ['<string>'],
      provider: 'anyscale',
      model: '<string>',
      temperature: 1,
      knowledgeBase: {
        provider: 'canonical',
        topK: 5.5,
        fileIds: ['<string>'],
      },
      maxTokens: 525,
      emotionRecognitionEnabled: true,
      numFastTurns: 1,
    },
    voice: {
      fillerInjectionEnabled: false,
      provider: 'azure',
      voiceId: 'andrew',
      speed: 1.25,
      chunkPlan: {
        enabled: true,
        minCharacters: 30,
        punctuationBoundaries: [
          '。',
          '，',
          '.',
          '!',
          '?',
          ';',
          '،',
          '۔',
          '।',
          '॥',
          '|',
          '||',
          ',',
          ':',
        ],
        formatPlan: {
          enabled: true,
          numberToDigitsCutoff: 2025,
        },
      },
    },
    firstMessageMode: 'assistant-speaks-first',
    recordingEnabled: true,
    hipaaEnabled: false,
    clientMessages: [
      'conversation-update',
      'function-call',
      'hang',
      'model-output',
      'speech-update',
      'status-update',
      'transcript',
      'tool-calls',
      'user-interrupted',
      'voice-input',
    ],
    serverMessages: [
      'conversation-update',
      'end-of-call-report',
      'function-call',
      'hang',
      'speech-update',
      'status-update',
      'tool-calls',
      'transfer-destination-request',
      'user-interrupted',
    ],
    silenceTimeoutSeconds: 30,
    maxDurationSeconds: 600,
    backgroundSound: 'office',
    backchannelingEnabled: false,
    backgroundDenoisingEnabled: false,
    modelOutputInMessagesEnabled: false,
    transportConfigurations: [
      {
        provider: 'twilio',
        timeout: 60,
        record: false,
        recordingChannels: 'mono',
      },
    ],
    name: '<string>',
    firstMessage: '<string>',
    voicemailDetection: {
      provider: 'twilio',
      voicemailDetectionTypes: ['machine_end_beep', 'machine_end_silence'],
      enabled: true,
      machineDetectionTimeout: 31,
      machineDetectionSpeechThreshold: 3500,
      machineDetectionSpeechEndThreshold: 2750,
      machineDetectionSilenceTimeout: 6000,
    },
    voicemailMessage: '<string>',
    endCallMessage: '<string>',
    endCallPhrases: ['<string>'],
    metadata: {},
    serverUrl: '<string>',
    serverUrlSecret: '<string>',
    analysisPlan: {
      summaryPrompt: '<string>',
      summaryRequestTimeoutSeconds: 10.5,
      structuredDataRequestTimeoutSeconds: 10.5,
      successEvaluationPrompt: '<string>',
      successEvaluationRubric: 'NumericScale',
      successEvaluationRequestTimeoutSeconds: 10.5,
      structuredDataPrompt: '<string>',
      structuredDataSchema: {
        type: 'string',
        items: {},
        properties: {},
        description: '<string>',
        required: ['<string>'],
      },
    },
    artifactPlan: {
      videoRecordingEnabled: true,
      recordingS3PathPrefix: '<string>',
    },
    messagePlan: {
      idleMessages: ['<string>'],
      idleMessageMaxSpokenCount: 5.5,
      idleTimeoutSeconds: 17.5,
    },
    startSpeakingPlan: {
      waitSeconds: 0.4,
      smartEndpointingEnabled: false,
      transcriptionEndpointingPlan: {
        onPunctuationSeconds: 0.1,
        onNoPunctuationSeconds: 1.5,
        onNumberSeconds: 0.5,
      },
    },
    stopSpeakingPlan: {
      numWords: 0,
      voiceSeconds: 0.2,
      backoffSeconds: 1,
    },
    credentialIds: ['<string>'],
  },
  phoneNumberId: '<string>',
  phoneNumber: {
    fallbackDestination: {
      type: 'number',
      numberE164CheckEnabled: true,
      number: '<string>',
      extension: '<string>',
      message: '<string>',
      description: '<string>',
    },
    twilioPhoneNumber: '<string>',
    twilioAccountSid: '<string>',
    twilioAuthToken: '<string>',
    name: '<string>',
    assistantId: '<string>',
    squadId: '<string>',
    serverUrl: '<string>',
    serverUrlSecret: '<string>',
  },
  customerId: '<string>',
  customer: {
    numberE164CheckEnabled: true,
    extension: '<string>',
    number: '<string>',
    sipUri: '<string>',
    name: '<string>',
  },
  name: '<string>',
};

const mockDontWait = {
  result: {
    id: 'call-id',
    cost: 0,
    type: 'outboundPhoneCall',
    orgId: 'org-id',
    status: 'queued',
    monitor: {
      listenUrl: 'wss://some-url/listen',
      controlUrl: 'https://some-url/control',
    },
    customer: {
      number: '+18011234567',
    },
    createdAt: '2024-10-16T23:29:16.253Z',
    updatedAt: '2024-10-16T23:29:16.253Z',
    assistantId: 'assistant-id',
    phoneNumberId: 'phone-number-id',
    phoneCallProvider: 'twilio',
    phoneCallTransport: 'pstn',
    phoneCallProviderId: 'phone-call-provider-id',
  },
};

type ConfigValue = z.infer<ReturnType<MakePhoneCall['aiSchema']>>;

type Response = typeof mock;

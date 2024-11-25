import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { z } from 'zod';
import { Vapi } from '../vapi.app';

export class GetPhoneCall extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Vapi;
  id() {
    return 'vapi_action_get-phone-call';
  }
  name() {
    return 'Get Phone Call';
  }
  description() {
    return 'Retrieve the details of an ongoing or completed phone call';
  }
  aiSchema() {
    return z.object({
      callId: z
        .string()
        .min(1)
        .describe('The ID of the phone call to retrieve'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        id: 'callId',
        inputType: 'text',
        description: 'The ID of the phone call to retrieve',
        label: 'Phone Call ID',
        placeholder: 'Enter the phone call ID',
        required: {
          missingMessage: 'Phone call ID is required',
          missingStatus: 'warning',
        },
      },
    ];
  }

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
    const url = `https://api.vapi.ai/call/${configValue.callId}`;

    const result = await this.app.http.loggedRequest({
      method: 'GET',
      url,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${connection.apiKey}`,
      },
      workspaceId,
    });

    return {
      result: result.data,
    } as any;
  }

  async mockRun(): Promise<Response> {
    return mock;
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

type ConfigValue = z.infer<ReturnType<GetPhoneCall['aiSchema']>>;

type Response = typeof mock;

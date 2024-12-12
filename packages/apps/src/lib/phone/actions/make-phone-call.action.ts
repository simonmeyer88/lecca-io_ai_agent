import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/phone.shared';

const DEFAULT_VOICE = 'cjVigY5qzO86Huf0OWal'; //Eric - American, friendly, middle-aged, male

export const makePhoneCall = createAction({
  id: 'phone_action_make-phone-call',
  name: 'Make Phone Call',
  description: `Make an AI phone call.`,
  aiSchema: z.object({
    customerPhoneNumber: z
      .string()
      .min(1)
      .describe(
        'The phone number to call, including the country and area code e.g. +18019999999',
      ),
    systemPrompt: z
      .string()
      .optional()
      .nullable()
      .describe(
        "The instructions given to the AI that makes the call. Pass in the relevant data needed to perform the call. If you're not sure what to put here, ask for clarification.",
      ),
    voice: z.enum([DEFAULT_VOICE]).optional().nullable(),
    openingLine: z
      .string()
      .optional()
      .nullable()
      .describe('The first line the AI will say when the call is connected.'),
    closingLine: z
      .string()
      .optional()
      .nullable()
      .describe('The last line the AI will say when the call is ending.'),
    voicemailMessage: z
      .string()
      .optional()
      .nullable()
      .describe('The message left when the call goes to voicemail.'),
    backgroundNoise: z
      .enum(['office', 'off'])
      .optional()
      .nullable()
      .default('off')
      .describe('The background noise to play during the call.'),
  }),
  inputConfig: [
    {
      id: 'customerPhoneNumber',
      inputType: 'text',
      description:
        'The phone number to call. Must include country and area code',
      label: 'Phone Number to Call',
      placeholder: 'Enter full phone number, e.g. +18019999999',
      required: {
        missingMessage: 'Phone number is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'voice',
      label: 'Voice',
      description: 'The voice to use for the call',
      placeholder: 'Select voice',
      inputType: 'dynamic-select',
      defaultValue: DEFAULT_VOICE,
      _getDynamicValues: async ({ workspaceId, http }) => {
        const voices = await http.request({
          method: 'GET',
          url: 'https://api.elevenlabs.io/v1/voices',
          headers: {
            'Content-Type': 'application/json',
          },
          workspaceId,
        });

        return (
          voices.data?.voices
            ?.map((voice: any) => {
              const descriptionPieces: string[] = [];

              if (voice.labels && voice.labels.use_case === 'conversational') {
                Object.values(voice.labels).forEach((label: any) => {
                  if (label !== 'conversational') {
                    descriptionPieces.push(label);
                  }
                });
              } else {
                return null;
              }

              const labelWithDescription = `${voice.name}${
                descriptionPieces?.length
                  ? ` - ${descriptionPieces.join(', ')}`
                  : ''
              }`;

              return {
                label: labelWithDescription,
                value: voice.voice_id,
              };
            })
            .filter(Boolean) || []
        );
      },
    },
    {
      id: 'systemPrompt',
      label: 'System Prompt',
      description: 'The prompt given to the AI that makes the call.',
      placeholder: 'Enter a prompt',
      inputType: 'text',
    },
    {
      id: 'openingLine',
      label: 'Opening Line',
      description: 'The first line the AI will say when the call is connected.',
      placeholder: 'Add text',
      inputType: 'text',
    },
    {
      id: 'closingLine',
      label: 'Closing Line',
      description: 'The last line the AI will say when the call is ending.',
      placeholder: 'Add text',
      inputType: 'text',
    },
    {
      id: 'voicemailMessage',
      label: 'Voicemail Message',
      description: 'The message left when the call goes to voicemail.',
      placeholder: 'Add text',
      inputType: 'text',
    },
    {
      id: 'backgroundNoise',
      label: 'Background Noise',
      description: 'The background noise to play during the call.',
      placeholder: 'Select background noise',
      inputType: 'select',
      selectOptions: [
        {
          label: 'Office',
          value: 'office',
        },
        {
          label: 'Off',
          value: 'off',
        },
      ],
      defaultValue: 'off',
    },
    {
      id: 'markdown',
      inputType: 'markdown',
      description: '',
      label: '',
      markdown:
        'Note that this action uses credits per call. The amount depends on how long the call was. Maximum of 10 minutes.',
    },
  ],
  run: async ({
    configValue,
    testing,
    workspaceId,
    projectId,
    agentId,
    executionId,
    workflowId,
    credits,
    http,
  }) => {
    await credits.checkIfWorkspaceHasEnoughCredits({
      workspaceId,
      usageType: 'vapi',
    });

    // Fetch the list of VAPI phone numbers using HTTP GET
    const getPhoneNumbersUrl = 'https://api.vapi.ai/phone-number';
    const phoneNumbersResult = await http.request({
      method: 'GET',
      url: getPhoneNumbersUrl,
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      },
      workspaceId,
    });

    // Fetch the list of VAPI assistants using HTTP GET
    const callUrl = 'https://api.vapi.ai/call';
    const result = await http.request({
      method: 'POST',
      url: callUrl,
      data: {
        phoneNumberId: phoneNumbersResult.data[0].id,
        maxDurationSeconds: 600,
        assistant: {
          model: {
            emotionRecognitionEnabled: true,
            messages: configValue.systemPrompt
              ? [
                  {
                    content: configValue.systemPrompt,
                    role: 'system',
                  },
                ]
              : [],
            model: 'gpt-3.5-turbo',
            provider: 'openai',
          },
          summaryPrompt: 'off',
          transcriber: {
            language: 'en',
            model: 'nova-2',
            provider: 'deepgram',
          },
          voice: {
            fillerInjectionEnabled: false,
            model: 'eleven_turbo_v2_5',
            provider: '11labs',
            similarityBoost: 0.75,
            stability: 0.5,
            voiceId: configValue.voice || DEFAULT_VOICE,
          },
          voicemailMessage: configValue.voicemailMessage || undefined,
          firstMessage: configValue.openingLine || undefined,
          endCallMessage: configValue.closingLine || undefined,
          backgroundSound: configValue.backgroundNoise || 'off',
          backgroundDenoisingEnabled: false,
          backchannelingEnabled: false,
        },
        customer: {
          number: configValue.customerPhoneNumber,
        },
      },
      headers: {
        Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
      },
      workspaceId,
    });

    //We'll wait for a total of 10 minutes
    const maxPolls = 60;
    const pollIntervalInSeconds = testing ? 2 : 10;

    let polls = 0;

    await new Promise((resolve) => setTimeout(resolve, 5000));

    while (polls < maxPolls) {
      const callUrl = `https://api.vapi.ai/call/${result.data.id}`;
      const callResult = await http.request({
        method: 'GET',
        url: callUrl,
        headers: {
          Authorization: `Bearer ${process.env.VAPI_API_KEY}`,
        },
        workspaceId,
      });

      if (callResult.data.status === 'ended') {
        //CLEAN DATA BECAUSE THERE IS SO MUCH
        const {
          createdAt,
          endedAt,
          endedResason,
          id,
          recordingUrl,
          startedAt,
          status,
          transcript,
        } = callResult.data;

        //CALCULATE COST
        const { cost } = callResult.data;

        //Because the cost is in Twilio, Vapi won't give it to us.
        const twilioCost = shared.calculateTwilioCostFromCallDuration({
          start: startedAt,
          end: endedAt,
        });

        const calculatedCreditsFromCost = credits.transformCostToCredits({
          usageType: 'vapi',
          data: {
            cost: twilioCost + cost,
          },
        });

        await credits.updateWorkspaceCredits({
          workspaceId,
          creditsUsed: calculatedCreditsFromCost,
          projectId,
          data: {
            ref: {
              agentId,
              executionId,
              workflowId,
            },
            details: {
              actionId: 'phone_action_make-phone-call',
              durationInMinutes:
                (new Date(endedAt).getTime() - new Date(startedAt).getTime()) /
                1000 /
                60,
            },
          },
        });

        return {
          result: {
            phoneNumber: configValue.customerPhoneNumber,
            durationInSeconds:
              (new Date(endedAt).getTime() - new Date(startedAt).getTime()) /
              1000,
            createdAt,
            endedAt,
            endedResason,
            id,
            recordingUrl,
            startedAt,
            status,
            transcript,
          },
        } as any;
      }

      await new Promise((resolve) =>
        setTimeout(resolve, pollIntervalInSeconds * 1000),
      );
      polls++;
    }
  },
  mockRun: async () => {
    return {
      phoneNumber: '+18019999999',
      status: 'queued',
      endedReason: 'assistant-error',
      id: '<string>',
      createdAt: '2023-11-07T05:31:56Z',
      startedAt: '2023-11-07T05:31:56Z',
      endedAt: '2023-11-07T05:31:56Z',
      transcript: '<string>',
      recordingUrl: '<string>',
    };
  },
});

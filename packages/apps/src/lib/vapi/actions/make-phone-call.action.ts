import { createAction } from '@lecca-io/toolkit';
import {
  createJsonInputField,
  createSwitchInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/vapi.shared';

export const makePhoneCall = createAction({
  id: 'vapi_action_make-phone-call',
  name: 'Make Phone Call',
  description: 'Start a phone call for selected voice agent',
  inputConfig: [
    createTextInputField({
      id: 'name',
      description: 'For your own reference',
      label: 'Name',
      placeholder: 'Enter a name',
    }),
    shared.fields.dynamicSelectVapiAssistants,
    shared.fields.dynamicSelectVapiPhoneNumbers,
    createTextInputField({
      id: 'customerPhoneNumber',
      description:
        'The phone number to call. Must include country and area code.',
      label: 'Phone Number to Call',
      placeholder: 'Enter full phone number, e.g. +18019999999',
      required: {
        missingMessage: 'Phone number is required',
        missingStatus: 'warning',
      },
    }),
    createJsonInputField({
      id: 'assistantOverrides',
      description:
        'Go to https://docs.vapi.ai/api-reference/calls/create-call to learn more.',
      label: 'Assistant Overrides',
      placeholder: 'Enter assistant overrides as JSON',
    }),
    createSwitchInputField({
      id: 'waitForFinish',
      description:
        'Wait for call to finish before returning result? Maximum wait time is 5 minutes.',
      label: 'Wait for Call to Finish',
      switchOptions: {
        checked: 'true',
        defaultChecked: true,
        unchecked: 'false',
      },
    }),
  ],
  aiSchema: z.object({
    name: z.string().optional().describe('Name to reference call'),
    vapiAssistantId: z.string().describe('The ID of the vapi assistant to use'),
    vapiPhoneNumberId: z
      .string()
      .describe('The ID of the vapi phone number to use'),
    customerPhoneNumber: z
      .string()
      .describe(
        'The phone number to call, including the county and area code e.g. +18019999999',
      ),
    assistantOverrides: z.any().nullable().optional(),
    waitForFinish: z
      .enum(['true', 'false'])
      .nullable()
      .optional()
      .describe('Wait for the call to finish before returning result?'),
  }),
  run: async ({ configValue, connection, workspaceId, http }) => {
    const url = 'https://api.vapi.ai/call';

    const result = await http.request({
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
        const callResult = await http.request({
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
          };
        }

        await new Promise((resolve) =>
          setTimeout(resolve, pollIntervalInSeconds * 1000),
        );
        polls++;
      }
    }

    return {
      result: result.data,
    };
  },
  mockRun: async ({ configValue }) => {
    if (configValue.waitForFinish === 'false') {
      return {
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
    }

    return {
      result: {
        type: 'outboundPhoneCall',
        messages: [
          {
            role: 'string',
            message: 'string',
            time: 123,
            endTime: 123,
            secondsFromStart: 123,
            duration: 123,
          },
        ],
        phoneCallProvider: 'twilio',
        status: 'ended',
        id: 'call-id',
      },
    };
  },
});

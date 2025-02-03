import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const getPhoneCall = createAction({
  id: 'vapi_action_get-phone-call',
  name: 'Get Phone Call',
  description: 'Retrieve the details of an ongoing or completed phone call',
  aiSchema: z.object({
    callId: z.string().describe('The ID of the phone call to retrieve'),
  }),
  inputConfig: [
    createTextInputField({
      id: 'callId',
      label: 'Phone Call ID',
      description: 'The ID of the phone call to retrieve',
      placeholder: 'Enter the phone call ID',
      required: {
        missingMessage: 'Phone call ID is required',
        missingStatus: 'warning',
      },
    }),
  ],
  run: async ({ configValue, connection, workspaceId, http }) => {
    const url = `https://api.vapi.ai/call/${configValue.callId}`;

    const result = await http.request({
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
    };
  },
  mockRun: async () => {
    return {
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
      costs: [{}],
      transcript: '<string>',
      recordingUrl: '<string>',
      stereoRecordingUrl: '<string>',
      analysis: {
        summary: '<string>',
        structuredData: {},
        successEvaluation: '<string>',
      },
      phoneCallProviderId: '<string>',
      assistantId: '<string>',
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
  },
});

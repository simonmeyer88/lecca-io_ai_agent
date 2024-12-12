import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

export const listPhoneNumbers = createAction({
  id: 'vapi_action_list-phone-numbers',
  name: 'List Phone Numbers',
  description: 'Retrieve the list of VAPI phone numbers',
  inputConfig: [],
  aiSchema: z.object({}),
  run: async ({ connection, workspaceId, http }) => {
    const url = 'https://api.vapi.ai/phone-number';

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
      phoneNumbers: result.data,
    };
  },

  mockRun: async () => ({
    phoneNumbers: [
      {
        id: 'phone_1_id',
        name: 'Phone 1',
        number: '+1234567890',
        orgId: 'some-org-id',
        createdAt: '2023-11-07T05:31:56Z',
        updatedAt: '2023-11-07T05:31:56Z',
      },
    ],
  }),
});

import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

export const listAssistants = createAction({
  id: 'vapi_action_list-assistants',
  name: 'List Assistants',
  description: 'Retrieve the list of VAPI assistants',
  inputConfig: [],
  aiSchema: z.object({}),
  run: async ({ connection, workspaceId, http }) => {
    const url = 'https://api.vapi.ai/assistant';

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
      assistants: result.data,
    };
  },
  mockRun: async () => ({
    assistants: [
      {
        id: 'assistant_1',
        name: 'Assistant 1',
        createdAt: '2023-11-07T05:31:56Z',
        voicemailMessage: '<string>',
        recordingEnabled: true,
        model: {
          emotionRecognitionEnabled: false,
          messages: [
            {
              content: 'Hello World',
              role: 'system',
            },
          ],
          model: 'gpt-3.5-turbo',
          provider: 'openai',
        },
      },
    ],
  }),
});

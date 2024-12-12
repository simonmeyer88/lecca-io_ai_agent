import { createAction } from '@lecca-io/toolkit';
import { createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const createPost = createAction({
  id: 'x_action_create-post',
  name: 'Create Post',
  description: 'Create a text post on X.',
  aiSchema: z.object({
    text: z.string().min(1).describe('The text to post on X'),
  }),
  inputConfig: [
    createTextInputField({
      id: 'text',
      label: 'Text',
      description: 'The text of the tweet',
      placeholder: 'Enter text',
      required: {
        missingMessage: 'Text is required',
        missingStatus: 'warning',
      },
    }),
  ],
  run: async ({ configValue, connection, workspaceId, http }) => {
    const { text } = configValue;

    const url = 'https://api.twitter.com/2/tweets/';

    const result = await http.request({
      method: 'POST',
      url,
      data: {
        text,
      },
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
      },
      workspaceId,
    });

    if (result?.data) {
      return result.data;
    } else {
      throw new Error('Failed to search tweets');
    }
  },
  mockRun: async () => {
    return {
      data: {
        id: '1849480123456789',
        edit_history_tweet_ids: ['1849480123456789'],
        text: 'Tweet text',
      },
    };
  },
});

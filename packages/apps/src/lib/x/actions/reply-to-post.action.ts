import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const replyToPost = createAction({
  id: 'x_action_reply-to-text-post',
  name: 'Reply to Post',
  description: 'Reply to a post on X',
  needsConnection: true,
  aiSchema: z.object({
    tweetId: z.string().min(1).describe('The ID of the tweet to reply to.'),
    text: z.string().min(1).describe('The text content of reply.'),
  }),
  inputConfig: [
    createTextInputField({
      id: 'tweetId',
      label: 'Tweet ID',
      description: 'The ID of the tweet to reply to.',
      placeholder: 'Enter tweet ID',
      required: {
        missingMessage: 'Tweet ID is required',
        missingStatus: 'warning',
      },
    }),
    createTextInputField({
      id: 'text',
      label: 'Text',
      description: 'The text of the reply.',
      placeholder: 'Enter text',
      required: {
        missingMessage: 'Text is required',
        missingStatus: 'warning',
      },
    }),
  ],
  run: async ({ configValue, connection, workspaceId, http }) => {
    const { text, tweetId } = configValue;

    if (!tweetId) {
      throw new Error('Tweet ID is required');
    }

    const url = 'https://api.twitter.com/2/tweets/';

    const body = {
      reply: {
        in_reply_to_tweet_id: tweetId,
      },
      text,
    };

    const result = await http.request({
      method: 'POST',
      url,
      data: body,
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

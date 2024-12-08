import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { X } from '../x.app';

export class ReplyToPost extends Action {
  app: X;
  id = 'x_action_reply-to-text-post';
  name = 'Reply to Post';
  description = 'Reply to a post on X';
  aiSchema = z.object({
    tweetId: z.string().min(1).describe('The ID of the tweet to reply to.'),
    text: z.string().min(1).describe('The text content of reply.'),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'tweetId',
      label: 'Tweet ID',
      description: 'The ID of the tweet to reply to.',
      placeholder: 'Enter tweet ID',
      inputType: 'text',
      required: {
        missingMessage: 'Tweet ID is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'text',
      label: 'Text',
      description: 'The text of the reply.',
      inputType: 'text',
      placeholder: 'Enter text',
      required: {
        missingMessage: 'Text is required',
        missingStatus: 'warning',
      },
    },
  ];

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
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

    const result = await this.app.http.loggedRequest({
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
  }

  async mockRun(): Promise<Response> {
    return {
      data: {
        id: '1849480123456789',
        edit_history_tweet_ids: ['1849480123456789'],
        text: 'Tweet text',
      },
    };
  }
}

type ConfigValue = z.infer<ReplyToPost['aiSchema']>;

type Response = {
  data: {
    id: string;
    edit_history_tweet_ids: string[];
    text: string;
  };
};

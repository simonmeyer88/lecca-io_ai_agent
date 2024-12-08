import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { X } from '../x.app';

export class CreatePost extends Action {
  app: X;

  id = 'x_action_create-post';
  name = 'Create Post';
  description = 'Create a text post on X.';
  aiSchema = z.object({
    text: z.string().min(1).describe('The text to post on X'),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'text',
      label: 'Text',
      description: 'The text of the tweet',
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
    const { text } = configValue;

    const url = 'https://api.twitter.com/2/tweets/';

    const result = await this.app.http.loggedRequest({
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

type ConfigValue = z.infer<CreatePost['aiSchema']>;

type Response = {
  data: {
    id: string;
    edit_history_tweet_ids: string[];
    text: string;
  };
};

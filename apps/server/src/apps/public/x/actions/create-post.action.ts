import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { z } from 'zod';
import { X } from '../x.app';

export class CreatePost extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: X;

  id() {
    return 'x_action_create-post';
  }

  name() {
    return 'Create Post';
  }

  description() {
    return 'Create a text post on X.';
  }

  aiSchema() {
    return z.object({
      text: z.string().min(1).describe('The text to post on X'),
    });
  }

  inputConfig(): InputConfig[] {
    return [
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
  }

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<ResponseType> {
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

  async mockRun(): Promise<ResponseType> {
    return {
      data: {
        id: '1849480123456789',
        edit_history_tweet_ids: ['1849480123456789'],
        text: 'Tweet text',
      },
    };
  }
}

type ResponseType = {
  data: {
    id: string;
    edit_history_tweet_ids: string[];
    text: string;
  };
};

type ConfigValue = z.infer<ReturnType<CreatePost['aiSchema']>>;

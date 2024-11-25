import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { z } from 'zod';
import { X } from '../x.app';

export class ReplyToPost extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: X;

  id() {
    return 'x_action_reply-to-text-post';
  }

  name() {
    return 'Reply to Post';
  }

  description() {
    return 'Reply to a post on X';
  }

  aiSchema() {
    return z.object({
      tweetId: z.string().min(1).describe('The ID of the tweet to reply to.'),
      text: z.string().min(1).describe('The text content of reply.'),
    });
  }

  inputConfig(): InputConfig[] {
    return [
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
  }

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<ResponseType> {
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

type ConfigValue = z.infer<ReturnType<ReplyToPost['aiSchema']>>;

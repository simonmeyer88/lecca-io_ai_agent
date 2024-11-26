import { Action } from '@/apps/lib/action';
import { Connection } from '@/apps/lib/connection';
import { Trigger } from '@/apps/lib/trigger';
import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { ServerConfig } from '@/config/server.config';

import { CreatePost } from './actions/create-post.action';
import { ReplyToPost } from './actions/reply-to-post.action';
import { XOAuth2 } from './connections/x.oauth2';

export class X extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

  id = 'x';
  name = 'X (Twitter)';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description =
    'X is a social media platform that allows users to post and interact with messages known as "tweets".';
  isPublished = true;

  connections(): Connection[] {
    return [new XOAuth2({ app: this })];
  }

  actions(): Action[] {
    return [new CreatePost({ app: this }), new ReplyToPost({ app: this })];
  }

  triggers(): Trigger[] {
    return [];
  }
}

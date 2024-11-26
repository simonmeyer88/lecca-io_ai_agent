import { Action } from '@/apps/lib/action';
import { Connection } from '@/apps/lib/connection';
import { Trigger } from '@/apps/lib/trigger';
import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { ServerConfig } from '@/config/server.config';

import { FacebookOAuth2 } from './connections/facebook-pages.oauth2';

export class FacebookPages extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

  id = 'facebook-pages';
  name = 'Facebook Pages';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description =
    'Facebook Pages allows businesses and organizations to create a presence on Facebook.';
  isPublished = true;

  connections(): Connection[] {
    return [new FacebookOAuth2({ app: this })];
  }

  actions(): Action[] {
    return [];
  }

  triggers(): Trigger[] {
    return [];
  }
}

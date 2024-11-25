import { Action } from '@/apps/lib/action';
import { Connection } from '@/apps/lib/connection';
import { Trigger } from '@/apps/lib/trigger';
import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { InstagramBusinessOAuth2 } from './connections/instagram-business.oauth2';
import { ServerConfig } from '@/config/server.config';

export class InstagramBusiness extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

  id = 'instagram-business';
  name = 'Instagram for Business';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description =
    'Instagram for Business is a platform that allows businesses to connect with their audience through visually engaging content.';
  isPublished = true;

  connections(): Connection[] {
    return [new InstagramBusinessOAuth2({ app: this })];
  }

  actions(): Action[] {
    return [];
  }

  triggers(): Trigger[] {
    return [];
  }
}

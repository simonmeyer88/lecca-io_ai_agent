import { Action } from '@/apps/lib/action';
import { App } from '@/apps/lib/app';
import { Connection } from '@/apps/lib/connection';
import { Trigger } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { InstagramBusinessOAuth2 } from './connections/instagram-business.oauth2';

export class InstagramBusiness extends App {
  id = 'instagram-business';
  name = 'Instagram for Business';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description =
    'Instagram for Business is a platform that allows businesses to connect with their audience through visually engaging content.';
  isPublished = false;

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

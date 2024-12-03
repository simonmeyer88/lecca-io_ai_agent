import { Action } from '@/apps/lib/action';
import { App } from '@/apps/lib/app';
import { Connection } from '@/apps/lib/connection';
import { Trigger } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { CloseOAuth2 } from './connections/close.oauth2';

export class Close extends App {
  id = 'close';
  name = 'Close';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description =
    'Close is the inside sales CRM of choice for startups and SMBs.';
  isPublished = false;

  connections(): Connection[] {
    return [new CloseOAuth2({ app: this })];
  }

  actions(): Action[] {
    return [];
  }

  triggers(): Trigger[] {
    return [];
  }
}

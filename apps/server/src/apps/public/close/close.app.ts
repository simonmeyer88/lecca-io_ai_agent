import { Action } from '@/apps/lib/action';
import { Connection } from '@/apps/lib/connection';
import { Trigger } from '@/apps/lib/trigger';
import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { ServerConfig } from '@/config/server.config';

import { CloseOAuth2 } from './connections/close.oauth2';

export class Close extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

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

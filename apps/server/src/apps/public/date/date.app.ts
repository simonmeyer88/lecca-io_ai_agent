import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { Action } from '@/apps/lib/action';
import { Trigger } from '@/apps/lib/trigger';
import { Connection } from '@/apps/lib/connection';
import { GetCurrentDate } from './actions/get-current-date.action';
import { ModifyDate } from './actions/modify-date.action';
import { FormatDate } from './actions/format-date.action';
import { ServerConfig } from '@/config/server.config';

export class DateHelper extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

  id = 'date';
  name = 'Date Helper';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description = `Date helper offered by ${ServerConfig.PLATFORM_NAME}`;
  isPublished = true;
  needsConnection = false;

  connections(): Connection[] {
    return [];
  }

  actions(): Action[] {
    return [
      new GetCurrentDate({ app: this }),
      new ModifyDate({ app: this }),
      new FormatDate({ app: this }),
    ];
  }

  triggers(): Trigger[] {
    return [];
  }
}

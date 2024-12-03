import { Action } from '@/apps/lib/action';
import { App } from '@/apps/lib/app';
import { Connection } from '@/apps/lib/connection';
import { Trigger } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { FormatDate } from './actions/format-date.action';
import { GetCurrentDate } from './actions/get-current-date.action';
import { ModifyDate } from './actions/modify-date.action';

export class DateHelper extends App {
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

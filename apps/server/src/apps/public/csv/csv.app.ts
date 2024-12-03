import { Action } from '@/apps/lib/action';
import { App } from '@/apps/lib/app';
import { Connection } from '@/apps/lib/connection';
import { Trigger } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { ConvertCsvToJson } from './actions/convert-csv-to-json.action';

export class CSV extends App {
  id = 'csv';
  name = 'CSV Helper';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description = `CSV helper offered by ${ServerConfig.PLATFORM_NAME}`;
  isPublished = true;
  needsConnection = false;

  connections(): Connection[] {
    return [];
  }

  actions(): Action[] {
    return [new ConvertCsvToJson({ app: this })];
  }

  triggers(): Trigger[] {
    return [];
  }
}

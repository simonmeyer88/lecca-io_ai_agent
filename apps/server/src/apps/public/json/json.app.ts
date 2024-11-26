import { Action } from '@/apps/lib/action';
import { Connection } from '@/apps/lib/connection';
import { Trigger } from '@/apps/lib/trigger';
import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { ServerConfig } from '@/config/server.config';

import { JsonParse } from './actions/json-parse.action';
import { JsonStringify } from './actions/json-stringify.action';

export class JSON extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

  id = 'json';
  name = 'JSON Helper';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description = `JSON helper offered by ${ServerConfig.PLATFORM_NAME}`;
  isPublished = true;
  needsConnection = false;

  connections(): Connection[] {
    return [];
  }

  actions(): Action[] {
    return [new JsonStringify({ app: this }), new JsonParse({ app: this })];
  }

  triggers(): Trigger[] {
    return [];
  }
}

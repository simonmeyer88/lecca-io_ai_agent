import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { Action } from '@/apps/lib/action';
import { Trigger } from '@/apps/lib/trigger';
import { Connection } from '@/apps/lib/connection';
import { JsonStringify } from './actions/json-stringify.action';
import { JsonParse } from './actions/json-parse.action';
import { ServerConfig } from '@/config/server.config';

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

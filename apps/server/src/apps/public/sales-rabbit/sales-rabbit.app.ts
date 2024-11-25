import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { Action } from '@/apps/lib/action';
import { Trigger } from '@/apps/lib/trigger';
import { Connection } from '@/apps/lib/connection';
import { SalesRabbitApiKey } from './connections/sales-rabbit-api-key';
import { LeadStatusUpdatedOnDevice } from './triggers/lead-status-updated-on-device.trigger';
import { ListLeadStatusActivities } from './actions/list-lead-status-activities.action';
import { ServerConfig } from '@/config/server.config';

export class SalesRabbit extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

  id = 'sales-rabbit';
  name = 'SalesRabbit';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description = 'SalesRabbit is the leading field sales management solution.';
  isPublished = true;
  connections(): Connection[] {
    return [new SalesRabbitApiKey({ app: this })];
  }
  actions(): Action[] {
    return [new ListLeadStatusActivities({ app: this })];
  }
  triggers(): Trigger[] {
    return [new LeadStatusUpdatedOnDevice({ app: this })];
  }
}

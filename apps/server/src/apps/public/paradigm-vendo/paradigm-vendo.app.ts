import { Action } from '@/apps/lib/action';
import { Connection } from '@/apps/lib/connection';
import { Trigger } from '@/apps/lib/trigger';
import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { ParadigmVendoKeyPair } from './connections/paradigm-vendo.key-pair';
import { GetAppointment } from './actions/get-appointment.action';
import { ServerConfig } from '@/config/server.config';

export class ParadigmVendo extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

  id = 'paradigm-vendo';
  name = 'Paradigm Vendo';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.webp`;
  description =
    'A digital selling solution that lets contractors and in-home sales professionals streamline selling.';
  isPublished = true;

  connections(): Connection[] {
    return [new ParadigmVendoKeyPair({ app: this })];
  }

  actions(): Action[] {
    return [new GetAppointment({ app: this })];
  }

  triggers(): Trigger[] {
    return [];
  }
}

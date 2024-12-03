import { Action } from '@/apps/lib/action';
import { App } from '@/apps/lib/app';
import { Connection } from '@/apps/lib/connection';
import { Trigger } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { GetAppointment } from './actions/get-appointment.action';
import { ParadigmVendoKeyPair } from './connections/paradigm-vendo.key-pair';

export class ParadigmVendo extends App {
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

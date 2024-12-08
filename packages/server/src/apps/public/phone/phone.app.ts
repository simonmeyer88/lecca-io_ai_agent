import { Action } from '@/apps/lib/action';
import { App } from '@/apps/lib/app';
import { Connection } from '@/apps/lib/connection';
import { Trigger } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { MakePhoneCall } from './actions/make-phone-call.action';

export class Phone extends App {
  id = 'phone';
  name = 'Phone';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description = `Make phone calls using ${ServerConfig.PLATFORM_NAME} credits`;
  isPublished = true;
  needsConnection = !!ServerConfig.VAPI_API_KEY;

  connections(): Connection[] {
    return [];
  }

  actions(): Action[] {
    return [new MakePhoneCall({ app: this })];
  }

  triggers(): Trigger[] {
    return [];
  }

  calculateTwilioCostFromCallDuration = ({
    start,
    end,
  }: {
    start: string;
    end: string;
  }) => {
    const startTime = new Date(start).getTime();
    const endTime = new Date(end).getTime();
    const duration = (endTime - startTime) / 1000;
    const costPerMinute = 0.013;
    const costPerSecond = costPerMinute / 60;
    const cost = duration * costPerSecond;

    return cost;
  };
}

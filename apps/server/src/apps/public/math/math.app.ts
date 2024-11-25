import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { Action } from '@/apps/lib/action';
import { Trigger } from '@/apps/lib/trigger';
import { Connection } from '@/apps/lib/connection';
import { Math as MathAction } from './actions/math.action';
import { Addition } from './actions/addition.action';
import { Subtraction } from './actions/subtraction.action';
import { Division } from './actions/division.action';
import { Multiplication } from './actions/multiplication.action';
import { ServerConfig } from '@/config/server.config';

export class Math extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

  id = 'math';
  name = 'Math Helper';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description = `Math helper offered by ${ServerConfig.PLATFORM_NAME}`;
  isPublished = true;
  needsConnection = false;

  connections(): Connection[] {
    return [];
  }

  actions(): Action[] {
    return [
      new MathAction({ app: this }),
      new Addition({ app: this }),
      new Subtraction({ app: this }),
      new Division({ app: this }),
      new Multiplication({ app: this }),
    ];
  }

  triggers(): Trigger[] {
    return [];
  }
}

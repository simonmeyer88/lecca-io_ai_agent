import { Action } from '@/apps/lib/action';
import { Connection } from '@/apps/lib/connection';
import { Trigger } from '@/apps/lib/trigger';
import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { MicrosoftOutlookOAuth2 } from './connections/microsoft-outlook.oauth2';
import { CreateDraft } from './actions/create-draft.action';
import { SendDraft } from './actions/send-draft.action';
import { EmailReceived } from './triggers/email-received.trigger';
import { ServerConfig } from '@/config/server.config';

export class MicrosoftOutlook extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

  id = 'microsoft-outlook';
  name = 'Microsoft Outlook';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description =
    "Microsoft Outlook is primarily an email and calendar application that's available as part of Microsoft's Office 365 suite";
  isPublished = true;

  connections(): Connection[] {
    return [new MicrosoftOutlookOAuth2({ app: this })];
  }

  actions(): Action[] {
    return [new CreateDraft({ app: this }), new SendDraft({ app: this })];
  }

  triggers(): Trigger[] {
    return [new EmailReceived({ app: this })];
  }
}

import { Action } from '@/apps/lib/action';
import { App, AppContructorArgs } from '@/apps/lib/app';
import { Connection } from '@/apps/lib/connection';
import { Trigger } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { CreateDraft } from './actions/create-draft.action';
import { SendDraft } from './actions/send-draft.action';
import { MicrosoftOutlookOAuth2 } from './connections/microsoft-outlook.oauth2';
import { EmailReceived } from './triggers/email-received.trigger';

export class MicrosoftOutlook extends App {
  constructor(args: AppContructorArgs) {
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

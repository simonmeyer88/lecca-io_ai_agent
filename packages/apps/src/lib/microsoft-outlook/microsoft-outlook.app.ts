import { createApp } from '@lecca-io/toolkit';

import { createDraft } from './actions/create-draft.action';
import { sendDraft } from './actions/send-draft.action';
import { microsoftOutlookOAuth2 } from './connections/microsoft-outlook.oauth2';
import { emailReceived } from './triggers/email-received.trigger';

export const microsoftOutlook = createApp({
  id: 'microsoft-outlook',
  name: 'Microsoft Outlook',
  description:
    "Microsoft Outlook is primarily an email and calendar application that's available as part of Microsoft's Office 365 suite",
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/microsoft-outlook.svg',
  actions: [createDraft, sendDraft],
  triggers: [emailReceived],
  connections: [microsoftOutlookOAuth2],
  needsConnection: true,
});

import { createApp } from '@lecca-io/toolkit';

import { archiveEmail } from './actions/archive-email.action';
import { createDraftReply } from './actions/create-draft-reply.action';
import { createDraft } from './actions/create-draft.action';
import { deleteDraft } from './actions/delete-draft.action';
import { findEmails } from './actions/find-emails.action';
import { getDrafts } from './actions/get-drafts.action';
import { getEmailById } from './actions/get-email-by-id.action';
import { getLabels } from './actions/get-labels.action';
import { getThreadMessages } from './actions/get-thread-messages.action';
import { labelEmail } from './actions/label-email.action';
import { replyToThread } from './actions/reply-to-thread.action';
import { sendDraft } from './actions/send-draft.action';
import { sendEmail } from './actions/send-email.action';
import { gmailOAuth2 } from './connections/gmail.oauth2';

export const gmail = createApp({
  id: 'gmail',
  name: 'Gmail',
  description: 'Gmail is an email service developed by Google.',
  logoUrl: 'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/gmail.svg',
  actions: [
    sendEmail,
    findEmails,
    createDraft,
    sendDraft,
    replyToThread,
    createDraftReply,
    getThreadMessages,
    getLabels,
    labelEmail,
    getEmailById,
    getDrafts,
    deleteDraft,
    archiveEmail,
  ],
  triggers: [],
  connections: [gmailOAuth2],
  needsConnection: true,
});

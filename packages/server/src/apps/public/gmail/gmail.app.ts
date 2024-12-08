import { google } from 'googleapis';
import Mail from 'nodemailer/lib/mailer';

import { Action } from '@/apps/lib/action';
import { App } from '@/apps/lib/app';
import { Connection } from '@/apps/lib/connection';
import { Trigger } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { ArchiveEmail } from './actions/archive-email.action';
import { CreateDraftReply } from './actions/create-draft-reply.action';
import { CreateDraft } from './actions/create-draft.action';
import { DeleteDraft } from './actions/delete-draft.action';
import { FindEmails } from './actions/find-emails.action';
import { GetDrafts } from './actions/get-drafts.action';
import { GetEmailById } from './actions/get-email-by-id.action';
import { GetLabels } from './actions/get-labels.action';
import { GetThreadMessages } from './actions/get-thread-messages.action';
import { LabelEmail } from './actions/label-email.action';
import { ReplyToThread } from './actions/reply-to-thread.action';
import { SendDraft } from './actions/send-draft.action';
import { SendEmail } from './actions/send-email.action';
import { GmailOAuth2 } from './connections/gmail.oauth2';
import { EmailReceived } from './triggers/email-received.trigger';
import {
  GmailDraft,
  GmailMessage,
  GmailParsedEmail,
} from './types/gmail.types';

export class Gmail extends App {
  id = 'gmail';
  name = 'Gmail';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description = 'Gmail is an email service developed by Google.';
  isPublished = true;

  connections(): Connection[] {
    return [new GmailOAuth2({ app: this })];
  }

  actions(): Action[] {
    return [
      new SendEmail({ app: this }),
      new FindEmails({ app: this }),
      new CreateDraft({ app: this }),
      new SendDraft({ app: this }),
      new ReplyToThread({ app: this }),
      new CreateDraftReply({ app: this }),
      new GetThreadMessages({ app: this }),
      new GetLabels({ app: this }),
      new LabelEmail({ app: this }),
      new GetEmailById({ app: this }),
      new GetDrafts({ app: this }),
      new DeleteDraft({ app: this }),
      new ArchiveEmail({ app: this }),
    ];
  }

  triggers(): Trigger[] {
    return [new EmailReceived({ app: this })];
  }

  async gmail({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }) {
    const oAuth2Client = this.getOAuth2Client();
    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const gmail = google.gmail({
      version: 'v1',
      auth: oAuth2Client,
    });

    return gmail;
  }

  decodeBase64(data: string) {
    const buff = Buffer.from(data, 'base64');
    return buff.toString('utf-8');
  }

  parseEmail(
    message: GmailMessage & any,
    {
      htmlOrText,
      includeBody = true,
    }: {
      htmlOrText?: 'html' | 'text' | 'both';
      includeBody?: boolean;
    },
  ): GmailParsedEmail {
    let bodyHtml: string | undefined;
    let bodyPlain: string | undefined;
    const payload = message.data.payload;
    let bodyParts = payload.parts || [];
    const headers = payload.headers.reduce(
      (
        obj: { [key: string]: string },
        header: { name: string; value: string },
      ) => {
        obj[header.name.toLowerCase()] = header.value;
        return obj;
      },
      {},
    );

    const subject = headers['subject'] || 'No Subject';
    const from = headers['from'];
    const to = headers['to'];
    const date = headers['date'];

    if (includeBody) {
      bodyHtml = '';
      bodyPlain = '';

      const contentType = headers['content-type'] || 'text/plain';
      const isMultipart = contentType.startsWith('multipart/');

      const alternateBodyPart = bodyParts.find((part: any) =>
        part.mimeType.startsWith('multipart/alternative'),
      );
      if (alternateBodyPart && alternateBodyPart?.parts) {
        bodyParts = alternateBodyPart.parts;
      }

      if (isMultipart) {
        // If the message is multipart, extract the plain text and HTML parts
        const textPart = bodyParts.find(
          (part: any) => part.mimeType === 'text/plain',
        );
        const htmlPart = bodyParts.find(
          (part: any) => part.mimeType === 'text/html',
        );

        // If the message is an "alternative" multipart, use the plain text part if it exists
        const preferredPart = textPart || htmlPart;
        bodyHtml = htmlPart ? this.decodeBase64(htmlPart.body.data) : '';
        bodyPlain = preferredPart
          ? this.decodeBase64(preferredPart.body.data)
          : '';
      } else {
        // If the message is not multipart, use the body as-is
        bodyPlain = this.decodeBase64(payload.body.data);
        bodyHtml = '';
      }
    }

    return {
      messageId: message.data.id,
      historyId: message.data.historyId,
      labelIds: message.data.labelIds,
      from,
      to,
      date,
      text: includeBody
        ? htmlOrText == 'both' || htmlOrText === 'text'
          ? bodyPlain
          : undefined
        : undefined,
      html: includeBody
        ? htmlOrText == 'both' || htmlOrText === 'html'
          ? bodyHtml
          : undefined
        : undefined,
      subject,
      sizeEstimate: message.data.sizeEstimate,
      threadId: message.data.threadId,
      internalDate: message.data.internalDate,
    };
  }

  parseDraft(draft: GmailDraft & any) {
    let bodyHtml = '';
    let bodyPlain = '';
    const payload = draft.data.message.payload;
    let bodyParts = payload.parts || [];
    const headers = payload.headers.reduce(
      (
        obj: { [key: string]: string },
        header: { name: string; value: string },
      ) => {
        obj[header.name.toLowerCase()] = header.value;
        return obj;
      },
      {},
    );
    const alternateBodyPart = bodyParts.find((part: any) =>
      part.mimeType.startsWith('multipart/alternative'),
    );
    if (alternateBodyPart && alternateBodyPart?.parts) {
      bodyParts = alternateBodyPart.parts;
    }

    const subject = headers['subject'] || 'No Subject';
    const contentType = draft.headers['content-type'] || 'text/plain';
    const isMultipart = contentType.startsWith('multipart/');

    if (isMultipart) {
      // If the message is multipart, extract the plain text and HTML parts
      const textPart = bodyParts.find(
        (part: any) => part.mimeType === 'text/plain',
      );
      const htmlPart = bodyParts.find(
        (part: any) => part.mimeType === 'text/html',
      );

      // If the message is an "alternative" multipart, use the plain text part if it exists
      const preferredPart = textPart || htmlPart;
      bodyHtml = htmlPart ? this.decodeBase64(htmlPart.body.data ?? '') : '';
      bodyPlain = preferredPart
        ? this.decodeBase64(preferredPart.body.data ?? '')
        : '';
    } else {
      // If the message is not multipart, use the body as-is
      bodyPlain = this.decodeBase64(payload.body.data ?? '');
      bodyHtml = '';
    }

    return {
      draftId: draft.data.id,
      messageId: draft.data.message.id,
      historyId: draft.data.message.historyId,
      labelIds: draft.data.message.labelIds,
      text: bodyPlain,
      html: bodyHtml,
      subject,
      sizeEstimate: draft.data.message.sizeEstimate,
      threadId: draft.data.message.threadId,
      internalDate: draft.data.message.internalDate,
    };
  }

  getOAuth2Client() {
    const GOOGLE_CLIENT_ID = ServerConfig.INTEGRATIONS.GMAIL_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET = ServerConfig.INTEGRATIONS.GMAIL_CLIENT_SECRET;
    const GOOGLE_CALLBACK_URL = `${ServerConfig.SERVER_URL}/workflow-apps/oauth2callback`;

    const oAuth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_CALLBACK_URL,
    );

    return oAuth2Client as any;
  }

  get mockEmail() {
    return {
      historyId: '2421409',
      html: '<p>Test email</p>',
      messageId: '18fee8f36aaa250e',
      from: '"Test User" <no-reply@test.com>',
      to: 'joe@test.com',
      date: 'Thu, 05 Sep 2024 21:20:15 +0000',
      internalDate: '1717695352000',
      labelIds: ['IMPORTANT', 'UNREAD', 'INBOX'],
      sizeEstimate: 9512,
      subject: 'Email is test data',
      text: 'test email',
      threadId: '18fee8f364aa259e',
    };
  }

  get mockDraft() {
    return {
      draftId: 'r7810836231207827967',
      historyId: '20386',
      html: '',
      internalDate: '1717700710000',
      messageId: '18feef0d2bcf350e',
      sizeEstimate: 568999,
      subject: 'Test draft',
      text: '',
      threadId: '18feef063e7feb9a',
    };
  }

  async fetchAttachment(url: string): Promise<Mail.Attachment | undefined> {
    try {
      if (url === '' || !url) {
        return undefined;
      }

      const { data, filename } = await this.fileHandler.downloadFile({
        url,
        dataType: 'buffer',
      });

      return {
        filename, // Dynamic filename from the response or URL
        content: data as Buffer, // The file content
      };
    } catch {
      throw new Error(`Error fetching attachment: ${url}`);
    }
  }
}

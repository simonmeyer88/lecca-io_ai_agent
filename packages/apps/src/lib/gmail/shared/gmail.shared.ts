import { InjectedServices } from '@lecca-io/toolkit';
import { google } from 'googleapis';
import Mail from 'nodemailer/lib/mailer';

export const shared = {
  fields: {},
  gmail({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }) {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.INTEGRATION_GMAIL_CLIENT_ID,
      process.env.INTEGRATION_GMAIL_CLIENT_SECRET,
      `${process.env.SERVER_URL}/workflow-apps/oauth2callback`,
    );

    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    return google.gmail({
      version: 'v1',
      auth: oAuth2Client,
    });
  },
  decodeBase64(data: string) {
    const buff = Buffer.from(data, 'base64');
    return buff.toString('utf-8');
  },
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
  },
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
  },
  mockEmail: {
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
  },
  mockDraft: {
    draftId: 'r7810836231207827967',
    historyId: '20386',
    html: '',
    internalDate: '1717700710000',
    messageId: '18feef0d2bcf350e',
    sizeEstimate: 568999,
    subject: 'Test draft',
    text: '',
    threadId: '18feef063e7feb9a',
  },
  async fetchAttachment({
    url,
    fileHandler,
  }: {
    url: string;
    fileHandler: InjectedServices['fileHandler'];
  }): Promise<Mail.Attachment | undefined> {
    try {
      if (url === '' || !url) {
        return undefined;
      }

      const { data, filename } = await fileHandler.downloadFile({
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
  },
};

export type GmailParsedEmail = {
  messageId: string;
  historyId: string;
  from: string;
  to: string;
  date: string;
  labelIds: string[];
  text: string;
  html: string;
  subject: string;
  sizeEstimate: number;
  threadId: string;
  internalDate: string;
};

export type GmailMessage = {
  data: {
    id?: string; //Message Id
    payload?: {
      parts?: {
        parts?: any[];
        partId?: string;
        mimeType?: string;
        filename?: string;
        headers?: {
          name: string;
          value: string;
        }[];
        body?: {
          size?: number;
          data?: string;
        };
      }[];
      body?: {
        data?: string;
      };
      headers?: { name: string; value: string }[];
    };
  };
  headers: Record<string, any>;
};

export type GmailDraft = {
  data: {
    id?: string; //Draft Id
    message?: {
      id?: string;
      threadId?: string;
      labelIds?: string[];
      snippet?: string;
      payload?: GmailMessage['data']['payload'];
      sizeEstimate?: number;
      historyId?: string;
      internalDate?: string;
    };
  };
  headers: Record<string, any>;
};

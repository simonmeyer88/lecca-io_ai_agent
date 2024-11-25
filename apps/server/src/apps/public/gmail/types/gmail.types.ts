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

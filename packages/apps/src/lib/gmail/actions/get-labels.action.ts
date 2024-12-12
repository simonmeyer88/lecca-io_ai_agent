import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/gmail.shared';

export const getLabels = createAction({
  id: 'gmail_action_get-labels',
  name: 'Get Labels',
  description: 'Get labels from gmail',
  aiSchema: z.object({}),
  inputConfig: [],
  run: async ({ connection }) => {
    const gmail = shared.gmail({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const labels = await gmail.users.labels.list({
      userId: 'me',
    });

    return labels.data.labels;
  },
  mockRun: async () => {
    return [
      {
        id: 'CHAT',
        labelListVisibility: 'labelHide',
        messageListVisibility: 'hide',
        name: 'CHAT',
        type: 'system',
      },
      {
        id: 'SENT',
        name: 'SENT',
        type: 'system',
      },
      {
        id: 'INBOX',
        labelListVisibility: 'labelShow',
        messageListVisibility: 'hide',
        name: 'INBOX',
        type: 'system',
      },
    ];
  },
});

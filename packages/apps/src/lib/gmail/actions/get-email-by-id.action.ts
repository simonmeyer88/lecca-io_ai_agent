import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/gmail.shared';

export const getEmailById = createAction({
  id: 'gmail_action_get-email-by-id',
  name: 'Get Email by ID',
  description: 'Retrieve a single email from Gmail using its message ID',
  inputConfig: [
    {
      label: 'Message ID',
      id: 'messageId',
      inputType: 'text',
      placeholder: 'Enter message ID',
      description: 'The unique ID of the Gmail message you want to retrieve',
      required: {
        missingMessage: 'Message ID is required',
        missingStatus: 'warning',
      },
    },
    {
      label: 'HTML or Text',
      id: 'htmlOrText',
      inputType: 'select',
      defaultValue: 'text',
      selectOptions: [
        { value: 'html', label: 'HTML' },
        { value: 'text', label: 'Text' },
        { value: 'both', label: 'Both' },
      ],
      loadOptions: {
        dependsOn: [
          {
            id: 'includeBody',
            value: 'true',
          },
        ],
      },
      description:
        'Choose whether to return the email as HTML, text, or both. Not every email will have both HTML and text versions.',
    },
  ],
  aiSchema: z.object({
    messageId: z.string().describe('The ID of the Gmail message to retrieve.'),
    htmlOrText: z
      .enum(['html', 'text', 'both'])
      .nullable()
      .optional()
      .describe('Choose whether to return the email as HTML, text, or both'),
  }),
  async run({ configValue, connection }) {
    const gmail = shared.gmail({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const messageResponse = await gmail.users.messages.get({
      userId: 'me',
      id: configValue.messageId,
    });

    return shared.parseEmail(messageResponse, {
      htmlOrText: configValue.htmlOrText,
    });
  },
  async mockRun() {
    return shared.mockEmail;
  },
});

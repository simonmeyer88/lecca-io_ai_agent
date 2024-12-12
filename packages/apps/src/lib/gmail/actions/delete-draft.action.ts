import { createAction } from '@lecca-io/toolkit';
import { createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/gmail.shared';

export const deleteDraft = createAction({
  id: 'gmail_action_delete-draft',
  name: 'Delete Draft',
  description: 'Delete a draft email in Gmail',
  aiSchema: z.object({
    draftId: z.string().describe('The ID of the draft to delete'),
  }),
  inputConfig: [
    createTextInputField({
      id: 'draftId',
      label: 'Draft ID',
      placeholder: 'Enter the draft ID',
      description: 'The unique ID of the draft you want to delete.',
      required: {
        missingMessage: 'Draft ID is required',
        missingStatus: 'warning',
      },
    }),
  ],
  run: async ({ configValue, connection }) => {
    const gmail = shared.gmail({
      accessToken: connection?.accessToken,
      refreshToken: connection?.refreshToken,
    });

    await gmail.users.drafts.delete({
      userId: 'me',
      id: configValue.draftId,
    });

    return { success: true, message: 'Draft deleted successfully.' };
  },
  mockRun: async () => {
    return { success: true, message: 'Mock draft deletion successful.' };
  },
});

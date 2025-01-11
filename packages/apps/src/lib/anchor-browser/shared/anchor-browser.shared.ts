import { createTextInputField } from '@lecca-io/toolkit';

export const shared = {
  fields: {
    sessionId: createTextInputField({
      id: 'sessionId',
      label: 'Session ID',
      description:
        'A session identifier to reference an existing running session.',
      placeholder: 'Add optional session ID',
    }),
  },
};

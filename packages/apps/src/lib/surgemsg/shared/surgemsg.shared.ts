import { createTextInputField } from '@lecca-io/toolkit';

export const shared = {
  fields: {
    accountId: createTextInputField({
      id: 'accountId',
      label: 'Account ID',
      description: 'The ID of the account to send the message from.',
      placeholder: 'Enter your account ID',
      required: {
        missingMessage: 'Account ID is required',
        missingStatus: 'warning',
      },
    }),
  },
};

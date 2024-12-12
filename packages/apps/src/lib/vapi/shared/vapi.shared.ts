import { createDynamicSelectInputField } from '@lecca-io/toolkit';

export const shared = {
  fields: {
    dynamicSelectVapiAssistants: createDynamicSelectInputField({
      label: 'Assistant',
      id: 'vapiAssistantId',
      placeholder: 'Select Assistant',
      description: 'The Assistant ID to use',
      _getDynamicValues: async ({ connection, workspaceId, http }) => {
        const url = 'https://api.vapi.ai/assistant';

        const result = await http.request({
          method: 'GET',
          url,
          headers: {
            Authorization: `Bearer ${connection.apiKey}`,
          },
          workspaceId,
        });

        // Assuming result.data is the list of assistants
        return (
          result?.data?.map((assistant) => ({
            value: assistant.id,
            label: assistant.name,
          })) ?? []
        );
      },
      required: {
        missingMessage: 'VAPI Assistant is required',
        missingStatus: 'warning',
      },
    }),
    dynamicSelectVapiPhoneNumbers: createDynamicSelectInputField({
      label: 'Phone Number to Use',
      id: 'vapiPhoneNumberId',
      placeholder: 'Select Phone Number',
      description: 'The Phone Number ID to use',
      _getDynamicValues: async ({ connection, workspaceId, http }) => {
        const url = 'https://api.vapi.ai/phone-number';

        const result = await http.request({
          method: 'GET',
          url,
          headers: {
            Authorization: `Bearer ${connection.apiKey}`,
          },
          workspaceId,
        });

        return (
          result?.data?.map((phone: { id: string; number: string }) => ({
            value: phone.id,
            label: phone.number,
          })) ?? []
        );
      },
      required: {
        missingMessage: 'VAPI Phone Number is required',
        missingStatus: 'warning',
      },
    }),
  },
};

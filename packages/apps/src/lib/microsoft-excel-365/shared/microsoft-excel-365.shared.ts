import { createDynamicSelectInputField } from '@lecca-io/toolkit';

export const shared = {
  fields: {
    dynamicSelectWorkbooks: createDynamicSelectInputField({
      id: 'workbookId',
      label: 'Workbook',
      description: 'Select a workbook',
      _getDynamicValues: async ({ connection, workspaceId, http }) => {
        const url =
          "https://graph.microsoft.com/v1.0/me/drive/root/search(q='.xlsx')?select=id,name";

        const response = await http.request({
          method: 'GET',
          url,
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
          },
          workspaceId,
        });

        return response?.data?.value.map((item: any) => ({
          value: item.id,
          label: item.name,
        }));
      },
      required: {
        missingStatus: 'warning',
        missingMessage: 'Workbook is required',
      },
    }),
  },
};

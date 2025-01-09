import { createDynamicSelectInputField } from '@lecca-io/toolkit';

export const shared = {
  fields: {
    dynamicBaseId: createDynamicSelectInputField({
      id: 'baseId',
      label: 'Base ID',
      description: 'The ID of the base to get the schema for.',
      _getDynamicValues: async ({ connection, http, workspaceId }) => {
        const { apiKey } = connection;

        const response = await http.request({
          method: 'GET',
          url: 'https://api.airtable.com/v0/meta/bases',
          workspaceId,
          headers: {
            Authorization: `Bearer ${apiKey}`,
          },
        });

        return (
          response.data.bases?.map((base) => ({
            label: base.name,
            value: base.id,
          })) ?? []
        );
      },
    }),
  },
};

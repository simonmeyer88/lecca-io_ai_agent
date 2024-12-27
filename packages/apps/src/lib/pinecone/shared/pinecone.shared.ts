import { createDynamicSelectInputField } from '@lecca-io/toolkit';

export const shared = {
  fields: {
    dynamicSelectIndexHost: createDynamicSelectInputField({
      id: 'indexHost',
      label: 'Index Host',
      description: 'Pinecone index host url',
      _getDynamicValues: async ({ connection, http, workspaceId }) => {
        const { apiKey } = connection;

        const response = await http.request({
          method: 'GET',
          url: 'https://api.pinecone.io/indexes',
          headers: {
            'Api-Key': apiKey,
            'X-Pinecone-API-Version': '2024-10',
          },
          workspaceId,
        });

        return (
          response.data.indexes?.map((index: PineconeIndex) => ({
            label: index.name,
            value: index.host,
          })) ?? []
        );
      },
    }),
  },
};

export type PineconeIndex = {
  name: string;
  metric: string;
  dimension: number;
  status: {
    state: string;
    ready: boolean;
  };
  host: string;
};

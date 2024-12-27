import {
  createAction,
  createJsonInputField,
  createTextInputField,
  jsonParse,
} from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/pinecone.shared';

export const upsertVector = createAction({
  id: 'pinecone_action_upsert-vector',
  name: 'Upsert Vector',
  description: 'Upsert vector to a Pinecone index',
  inputConfig: [
    shared.fields.dynamicSelectIndexHost,
    createTextInputField({
      id: 'id',
      label: 'Unique Vector ID',
      description: "This is the vector's unique ID",
      placeholder: 'Enter unique value',
    }),
    createJsonInputField({
      id: 'values',
      label: 'Values',
      description: 'Vector embeddings to upsert',
      required: {
        missingMessage: 'Values are required',
        missingStatus: 'warning',
      },
      placeholder: 'Enter embedding values',
    }),
    createJsonInputField({
      id: 'metadata',
      label: 'Metadata',
      description: 'Metadata for the vector',
      placeholder: 'Enter metadata',
    }),
    createTextInputField({
      id: 'namespace',
      label: 'Namespace',
      description: 'Optional namespace for the vector',
      placeholder: 'Add optional namespace',
    }),
  ],
  aiSchema: z.object({
    indexHost: z.string(),
    id: z.string().describe('A unique ID of the vector to upsert'),
    values: z.array(z.number()).describe('The vector embeddings to upsert'),
    metadata: z.any().nullable().optional(),
    namespace: z
      .string()
      .describe('Namespace for the vector')
      .nullable()
      .optional(),
  }),
  run: async ({ connection, configValue, workspaceId, http }) => {
    const { apiKey } = connection;

    const data = {
      vectors: [
        {
          id: configValue.id,
          values: jsonParse(configValue.values),
          metadata: configValue.metadata
            ? jsonParse(configValue.metadata)
            : undefined,
        },
      ],
      namespace: configValue.namespace ? configValue.namespace : undefined,
    };

    const response = await http.request({
      method: 'POST',
      url: `https://${configValue.indexHost}/vectors/upsert`,
      data,
      headers: {
        'Api-Key': apiKey,
        'X-Pinecone-API-Version': '2024-10',
      },
      workspaceId,
    });

    return { response: response.data };
  },
  mockRun: async () => {
    return {
      response: { upsertedCount: 1 },
    };
  },
});

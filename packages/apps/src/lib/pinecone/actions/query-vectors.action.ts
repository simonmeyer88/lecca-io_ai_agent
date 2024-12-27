import {
  createAction,
  createJsonInputField,
  createNumberInputField,
  createSwitchInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/pinecone.shared';

export const queryVectors = createAction({
  id: 'pinecone_action_query-vectors',
  name: 'Query Vectors',
  description: 'Query vectors from a Pinecone index',
  inputConfig: [
    shared.fields.dynamicSelectIndexHost,
    createJsonInputField({
      id: 'values',
      label: 'Values',
      description:
        'The query vector. Should be the same length of the dimension of the index being queried.',
      required: {
        missingMessage: 'Values are required',
        missingStatus: 'warning',
      },
      placeholder: 'Enter vector embeddings',
    }),
    createNumberInputField({
      id: 'topK',
      label: 'TopK',
      description: 'The number of results to return for each query',
      required: {
        missingMessage: 'TopK is required',
        missingStatus: 'warning',
      },
      placeholder: 'Add search limit',
    }),
    createJsonInputField({
      id: 'filter',
      label: 'Filter',
      description: 'Filter to apply to the query',
      placeholder: 'Add optional filter',
    }),
    createSwitchInputField({
      id: 'includeValues',
      label: 'Include Values',
      description: '',
      switchOptions: {
        checked: 'true',
        unchecked: 'false',
        defaultChecked: false,
      },
    }),
    createSwitchInputField({
      id: 'includeMetadata',
      label: 'Include Metadata',
      description: '',
      switchOptions: {
        checked: 'true',
        unchecked: 'false',
        defaultChecked: true,
      },
    }),
    createTextInputField({
      id: 'namespace',
      label: 'Namespace',
      description: 'Namespace to query',
    }),
  ],
  aiSchema: z.object({
    indexHost: z.string(),
    values: z.string().describe('The query vector'),
    topK: z
      .number()
      .min(1)
      .max(10000)
      .describe('The number of results to return for each query'),
    filter: z
      .any()
      .describe('Filter to apply to the query')
      .nullable()
      .optional(),
    includeValues: z
      .enum(['true', 'false'])
      .describe('Include vector values in the response'),
    includeMetadata: z
      .enum(['true', 'false'])
      .describe('Include metadata in the response'),
    namespace: z.string().describe('Namespace to query').nullable().optional(),
  }),
  run: async ({ connection, configValue, workspaceId, http }) => {
    const { apiKey } = connection;

    const data = {
      vector: JSON.parse(configValue.values),
      topK: configValue.topK,
      filter: configValue.filter ? JSON.parse(configValue.filter) : undefined,
      includeValues: configValue.includeValues === 'true',
      includeMetadata: configValue.includeMetadata === 'true',
      namespace: configValue.namespace ? configValue.namespace : undefined,
    };

    const response = await http.request({
      method: 'POST',
      url: `https://${configValue.indexHost}/query`,
      data,
      headers: {
        'Api-Key': apiKey,
        'X-Pinecone-API-Version': '2024-10',
      },
      workspaceId,
    });

    return response.data;
  },
  mockRun: async () => {
    return {
      results: [],
      matches: [
        {
          id: '1',
          score: 0.8,
          metadata: {
            name: 'John Doe',
            age: 25,
            location: 'New York',
          },
        },
      ],
      namespace: '',
      usage: {
        readUnits: 6,
      },
    };
  },
});

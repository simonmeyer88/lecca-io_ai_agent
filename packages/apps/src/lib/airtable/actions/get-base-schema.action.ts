import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/airtable.shared';

export const getBaseSchema = createAction({
  id: 'airtable_action_get-base-schema',
  name: 'Get Base Schema',
  description: 'Returns the schema of the tables in the specified base.',
  inputConfig: [shared.fields.dynamicBaseId],
  aiSchema: z.object({
    baseId: z.string().describe('The ID of the base to get the schema for.'),
  }),
  run: async ({ connection, http, workspaceId, configValue }) => {
    const { baseId } = configValue;
    const { apiKey } = connection;

    const response = await http.request({
      method: 'GET',
      url: `https://api.airtable.com/v0/meta/bases/${baseId}/tables`,
      workspaceId,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return response.data;
  },
  mockRun: async () => {
    return {
      tables: [
        {
          description: 'Apartments to track.',
          fields: [
            {
              description: 'Name of the apartment',
              id: 'fld1VnoyuotSTyxW1',
              name: 'Name',
              type: 'singleLineText',
            },
          ],
          id: 'tbltp8DGLhqbUmjK1',
          name: 'Apartments',
          primaryFieldId: 'fld1VnoyuotSTyxW1',
          views: [
            {
              id: 'viwQpsuEDqHFqegkp',
              name: 'Grid view',
              type: 'grid',
            },
          ],
        },
      ],
    };
  },
});

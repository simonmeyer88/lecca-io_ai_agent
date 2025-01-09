import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

export const listBases = createAction({
  id: 'airtable_action_list-bases',
  name: 'List Bases',
  description: 'List all bases',
  inputConfig: [],
  aiSchema: z.object({}),
  run: async ({ connection, http, workspaceId }) => {
    const { apiKey } = connection;

    const response = await http.request({
      method: 'GET',
      url: 'https://api.airtable.com/v0/meta/bases',
      workspaceId,
      headers: {
        Authorization: `Bearer ${apiKey}`,
      },
    });

    return response.data;
  },
  mockRun: async () => {
    return {
      bases: [
        {
          id: 'appLkNDICXNqxSDhG',
          name: 'Apartment Hunting',
          permissionLevel: 'create',
        },
        {
          id: 'appSW9R5uCNmRmfl6',
          name: 'Project Tracker',
          permissionLevel: 'edit',
        },
      ],
      offset: 'itr23sEjsdfEr3282/appSW9R5uCNmRmfl6',
    };
  },
});

import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/microsoft-excel-365.shared';

export const getWorksheets = createAction({
  id: 'microsoft-excel-365_action_get-worksheets',
  name: 'Get Worksheets',
  description: 'Get a list of worksheets from a workbook',
  aiSchema: z.object({
    workbookId: z
      .string()
      .min(1)
      .describe('The ID of the workbook to get worksheets from'),
  }),
  inputConfig: [shared.fields.dynamicSelectWorkbooks],
  needsConnection: true,
  run: async ({ configValue, connection, workspaceId, http }) => {
    const url = `https://graph.microsoft.com/v1.0/me/drive/items/${configValue.workbookId}/workbook/worksheets`;

    const response = await http.request({
      method: 'GET',
      url,
      headers: {
        Authorization: `Bearer ${connection.accessToken}`,
      },
      workspaceId,
    });

    return response.data.value.map((item: any) => ({
      id: item.id,
      name: item.name,
    }));
  },
  mockRun: async () => {
    return [
      {
        id: '{00000000-0000-0000-0000-000000000000}',
        name: 'Sheet1',
        position: 0,
        visibility: 'Visible',
      },
    ];
  },
});

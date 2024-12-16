import { createAction, createTextInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/zoho-crm.shared';

export const upsertLead = createAction({
  id: 'zoho-crm_action_upsert-lead',
  name: 'Upsert Lead',
  description: 'Create a new lead or update an existing lead.',
  inputConfig: [
    createTextInputField({
      id: 'leadId',
      label: 'Lead ID',
      description: 'The ID of the lead you want to update (if exists).',
      placeholder: 'Enter the lead ID (optional)',
    }),
    shared.fields.dynamicGetLeadFields,
  ],
  aiSchema: z.object({
    leadId: z
      .string()
      .nullable()
      .optional()
      .describe(
        'The ID of the lead to update, if exists. If not provided, a new lead will be created.',
      ),
    fields: z
      .array(
        z.object({
          field: z.string().min(1).describe('The field to update'),
          value: z.string().min(1).describe('The value to update'),
        }),
      )
      .min(1)
      .describe('The field and value for the field to update'),
  }),
  run: async ({ configValue, connection, workspaceId, http }) => {
    const { leadId, fields } = configValue;

    const url = leadId?.trim()
      ? `https://www.zohoapis.com/crm/v2/Leads/${leadId}`
      : `https://www.zohoapis.com/crm/v2/Leads/upsert`;

    const requestBody: {
      data: Record<string, string>[];
      duplicate_check_fields?: string[];
    } = {
      data: [{}],
    };

    fields.forEach(({ field, value }) => {
      requestBody.data[0][field] = value;
      if (field === 'Email') {
        requestBody.duplicate_check_fields = [field];
      }
    });

    const method = leadId?.trim() ? 'put' : 'post';

    const response = await http.request({
      method,
      url,
      headers: {
        Authorization: `Zoho-oauthtoken ${connection.accessToken}`,
      },
      workspaceId,
      data: requestBody,
    });

    if (response.data?.data?.[0]?.status === 'error') {
      throw new Error(JSON.stringify(response.data?.data));
    }

    return response.data;
  },
  mockRun: async () => {
    return {
      data: [
        {
          code: 'SUCCESS',
          status: 'success',
          details: {
            id: '1119196000000503001',
            Created_By: {
              id: '0000096000000479001',
              name: 'John Doe',
            },
            Modified_By: {
              id: '0000096000000479001',
              name: 'John Doe',
            },
            Created_Time: '2024-09-05T11:42:28-06:00',
            Modified_Time: '2024-09-05T11:42:28-06:00',
          },
          message: 'record added',
          duplicate_field: null,
        },
      ],
    };
  },
});

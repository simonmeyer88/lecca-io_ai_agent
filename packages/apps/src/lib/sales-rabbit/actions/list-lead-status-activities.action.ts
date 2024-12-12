import { createAction, parseDateToISO } from '@lecca-io/toolkit';
import {
  createDateTimeInputField,
  createNumberInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

export const listLeadStatusActivities = createAction({
  id: 'sales-rabbit_action_list-lead-status-activities',
  name: 'List Lead Status Activities',
  description: 'Lists lead status activities.',
  inputConfig: [
    createNumberInputField({
      id: 'page',
      label: 'Page',
      description: 'The result page number to return.',
      defaultValue: 1,
      numberOptions: {
        min: 1,
      },
    }),
    createNumberInputField({
      id: 'perPage',
      label: 'Per Page',
      description: 'The number of results per page.',
      defaultValue: 50,
      numberOptions: {
        min: 1,
        max: 100,
      },
    }),
    createDateTimeInputField({
      id: 'ifStatusModifiedSince',
      label: 'Status Modified Since',
      description:
        'Only return results that have had their status modified since this date.',
    }),
  ],
  aiSchema: z.object({
    page: z.number().int().positive().default(1),
    perPage: z.number().int().positive().max(500).default(100),
    ifStatusModifiedSince: z
      .string()
      .describe(
        'Return results that have had their status modified since this date. ISO format.',
      )
      .nullable()
      .optional(),
  }),
  run: async ({ connection, configValue, workspaceId, http }) => {
    let url = `https://api.salesrabbit.com/leadStatusActivities`;

    const isoDate = configValue.ifStatusModifiedSince
      ? parseDateToISO(configValue.ifStatusModifiedSince)
      : undefined;

    const urlParams = new URLSearchParams({
      page: configValue.page.toString(),
      perPage: configValue.perPage.toString(),
    });

    url += `?${urlParams.toString()}`;

    const response = await http.request({
      method: 'GET',
      url,
      headers: {
        Authorization: `Bearer ${connection.apiKey}`,
        'If-Status-Modified-Since': isoDate,
      },
      workspaceId,
    });

    return response.data?.data;
  },
  mockRun: async () => ({
    currentLeadCreated: '2022-10-26T18:00:00+00:00',
    currentLeadCustomFields: {},
    currentLeadFirstName: '',
    currentLeadLastName: '',
    currentLeadIsActive: false,
    currentLeadLatitude: 40.4210433,
    currentLeadLongitude: -111.8827517,
    currentLeadModified: '2024-05-29T20:54:35+00:00',
    currentLeadOwnerEmail: 'john.doe@email.com',
    currentLeadOwnerID: 911705181,
    currentOnDeviceStatusCreated: '2024-05-29T20:54:35',
    currentOnDeviceStatusModified: '2024-05-29T20:55:33',
    dispositionID: 74601,
    dispositionLeadID: 34570,
    dispositionLeadStageID: '1',
    dispositionLeadStatusAbbreviation: 'MOVE',
    dispositionLeadStatusID: 210,
    dispositionLeadStatusName: 'New Mover',
    dispositionTimestamp: '2024-05-29T20:54:35+00:00',
    dispositionType: 'User',
    dispositionerID: '911705181',
    dispositionerProximityInFeet: 68,
    dispositionerProximityLatitude: 40.4210968604357,
    dispositionerProximityLongitude: -111.8829876767247,
    dispositionerProximityStatus: 'At location',
  }),
});

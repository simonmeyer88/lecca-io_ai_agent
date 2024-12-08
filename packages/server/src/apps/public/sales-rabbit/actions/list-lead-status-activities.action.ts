import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { parseDateToISO } from '@/apps/utils/parse-date-to-iso';

import { SalesRabbit } from '../sales-rabbit.app';

export class ListLeadStatusActivities extends Action {
  app: SalesRabbit;
  id = 'sales-rabbit_action_list-lead-status-activities';
  name = 'List Lead Status Activities';
  description = 'Lists lead status activities.';
  aiSchema = z.object({
    page: z.number().int().positive().default(1),
    perPage: z.number().int().positive().max(500).default(100),
    ifStatusModifiedSince: z
      .string()
      .describe(
        'Return results that have had their status modified since this date. ISO format.',
      )
      .nullable()
      .optional(),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'page',
      inputType: 'number',
      label: 'Page',
      description: 'The result page number to return.',
      numberOptions: {
        min: 1,
      },
      defaultValue: 1,
    },
    {
      id: 'perPage',
      inputType: 'number',
      label: 'Per Page',
      description: 'The number of results per page.',
      numberOptions: {
        min: 1,
        max: 100,
      },
      defaultValue: 50,
    },
    {
      id: 'ifStatusModifiedSince',
      inputType: 'date-time',
      label: 'Status Modified Since',
      description:
        'Only return results that have had their status modified since this date.',
    },
  ];

  async run({
    connection,
    configValue,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<typeof mock> {
    let url = `https://api.salesrabbit.com/leadStatusActivities`;

    const isoDate = configValue.ifStatusModifiedSince
      ? parseDateToISO(configValue.ifStatusModifiedSince)
      : undefined;

    const urlParams = new URLSearchParams({
      page: configValue.page.toString(),
      perPage: configValue.perPage.toString(),
    });

    url += `?${urlParams.toString()}`;

    const response = await this.app.http.loggedRequest({
      method: 'GET',
      url,
      headers: {
        Authorization: `Bearer ${connection.apiKey}`,
        'If-Status-Modified-Since': isoDate,
      },
      workspaceId,
    });

    return response.data?.data;
  }

  async mockRun(): Promise<typeof mock> {
    return mock;
  }
}

const mock = {
  currentLeadCreated: '2022-10-26T18:00:00+00:00',
  currentLeadCustomFields: {},
  currentLeadFirstName: '',
  currentLeadIsActive: false,
  currentLeadLastName: '',
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
};

type ConfigValue = z.infer<ListLeadStatusActivities['aiSchema']>;

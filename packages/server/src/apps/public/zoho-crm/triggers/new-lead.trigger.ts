import { InputConfig } from '@/apps/lib/input-config';
import { RunTriggerArgs, TimeBasedPollTrigger } from '@/apps/lib/trigger';
import { dateStringToMilliOrNull } from '@/apps/utils/date-string-to-milli-or-null';

import { ZohoCrm } from '../zoho-crm.app';

export class NewLead extends TimeBasedPollTrigger {
  app: ZohoCrm;
  id = 'zoho-crm_trigger_new-lead';
  name = 'New Lead';
  description = 'Triggers when a new lead is created in Zoho CRM';
  inputConfig: InputConfig[] = [];

  async run({
    connection,
    workspaceId,
  }: RunTriggerArgs<unknown>): Promise<ContactType[]> {
    const response = await this.app.http.loggedRequest({
      method: 'GET',
      url: `https://www.zohoapis.com/crm/v2/Leads`,
      headers: {
        Authorization: `Zoho-oauthtoken ${connection.accessToken}`,
      },
      params: {
        page: 1,
        per_page: 10,
        sort_order: 'desc',
        sort_by: 'Created_Time',
      },
      workspaceId,
    });

    const contacts = response?.data?.data ?? [];

    return contacts;
  }

  async mockRun(): Promise<ContactType[]> {
    return [mock];
  }

  extractTimestampFromResponse({ response }: { response: ContactType }) {
    return dateStringToMilliOrNull(response.Created_Time);
  }
}

const mock = {
  id: '1119196000000505001',
  Created_By: {
    id: '0000096000000478001',
    name: 'Jane Doe',
  },
  Modified_By: {
    id: '0000096000000478001',
    name: 'Jane Doe',
  },
  Created_Time: '2024-09-05T12:00:00-06:00',
  Modified_Time: '2024-09-05T12:00:00-06:00',
};

type ContactType = typeof mock;

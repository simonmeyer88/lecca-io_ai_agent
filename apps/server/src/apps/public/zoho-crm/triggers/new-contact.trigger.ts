import { InputConfig } from '@/apps/lib/input-config';
import {
  RunTriggerArgs,
  TimeBasedPollTrigger,
  TriggerConstructorArgs,
} from '@/apps/lib/trigger';
import { DateStringToMilliOrNull } from '@/apps/utils/date-string-to-milli-or-null';

import { ZohoCrm } from '../zoho-crm.app';

export class NewContact extends TimeBasedPollTrigger {
  constructor(args: TriggerConstructorArgs) {
    super(args);
  }

  app: ZohoCrm;

  id() {
    return 'zoho-crm_trigger_new-contact';
  }

  name() {
    return 'New Contact';
  }

  description() {
    return 'Triggers when a new contact is created in Zoho CRM';
  }

  inputConfig(): InputConfig[] {
    return [];
  }

  async run({ connection }: RunTriggerArgs<unknown>): Promise<ContactType[]> {
    const response = await this.app.http.loggedRequest({
      method: 'GET',
      url: `https://www.zohoapis.com/crm/v2/Contacts`,
      headers: {
        Authorization: `Zoho-oauthtoken ${connection.accessToken}`,
      },
      params: {
        page: 1,
        per_page: 10,
        sort_order: 'desc',
        sort_by: 'Created_Time',
      },
      workspaceId: 'workspaceId',
    });

    const contacts = response?.data?.data ?? [];

    return contacts;
  }

  async mockRun(): Promise<ContactType[]> {
    return [mock];
  }

  extractTimestampFromResponse({ response }: { response: ContactType }) {
    return DateStringToMilliOrNull(response.Created_Time);
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

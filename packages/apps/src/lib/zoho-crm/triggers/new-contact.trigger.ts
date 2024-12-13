import {
  createTimeBasedPollTrigger,
  dateStringToMilliOrNull,
} from '@lecca-io/toolkit';

export const newContact = createTimeBasedPollTrigger({
  id: 'zoho-crm_trigger_new-contact',
  name: 'New Contact',
  description: 'Triggers when a new contact is created in Zoho CRM',
  inputConfig: [],
  run: async ({ connection, http }) => {
    const response = await http.request({
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
  },
  mockRun: async () => {
    return [mock];
  },
  extractTimestampFromResponse: ({ response }: { response: ContactType }) => {
    return dateStringToMilliOrNull(response.Created_Time);
  },
});

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

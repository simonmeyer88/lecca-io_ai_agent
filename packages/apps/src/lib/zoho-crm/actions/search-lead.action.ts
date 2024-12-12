import {
  createAction,
  createNumberInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

export const searchLeads = createAction({
  id: 'zoho-crm_action_search-leads',
  name: 'Search Leads',
  description: 'Search for leads in ZohoCRM based on various search criteria.',
  needsConnection: true,
  inputConfig: [
    {
      id: 'markdown',
      markdown: 'Enter any criteria to search by.',
      inputType: 'markdown',
      label: '',
      description: '',
    },
    createTextInputField({
      id: 'email',
      label: 'Email',
      description: '',
      placeholder: 'Enter the lead email',
    }),
    createTextInputField({
      id: 'firstName',
      label: 'First Name',
      description: '',
      placeholder: 'Enter the first name',
    }),
    createTextInputField({
      id: 'lastName',
      label: 'Last Name',
      description: '',
      placeholder: 'Enter the last name',
    }),
    createTextInputField({
      id: 'company',
      label: 'Company',
      description: '',
      placeholder: 'Enter the company name',
    }),
    createTextInputField({
      id: 'phone',
      label: 'Phone',
      description: '',
      placeholder: 'Enter the phone number',
    }),
    createTextInputField({
      id: 'status',
      label: 'Status',
      description: '',
      placeholder: 'Enter the lead status',
    }),
    createNumberInputField({
      id: 'page',
      label: 'Page Number',
      description: 'The page number to retrieve',
      defaultValue: 1,
      numberOptions: {
        min: 1,
      },
    }),
    createNumberInputField({
      id: 'perPage',
      label: 'Leads per Page',
      description: 'Number of leads to retrieve per page (Max: 50)',
      defaultValue: 50,
      numberOptions: {
        min: 1,
        max: 50,
        step: 1,
      },
    }),
  ],
  aiSchema: z.object({
    page: z.number().default(1).describe('Page number for lead results'),
    perPage: z
      .number()
      .max(100)
      .default(10)
      .describe('Number of leads per page (Max: 50)'),
    email: z
      .string()
      .email()
      .nullable()
      .optional()
      .describe('Email address of the lead to search for.'),
    firstName: z
      .string()
      .nullable()
      .optional()
      .describe('First name of the lead to search for.'),
    lastName: z
      .string()
      .nullable()
      .optional()
      .describe('Last name of the lead to search for.'),
    company: z
      .string()
      .nullable()
      .optional()
      .describe('Company name associated with the lead to search for.'),
    phone: z
      .string()
      .nullable()
      .optional()
      .describe('Phone number of the lead to search for.'),
    status: z
      .string()
      .nullable()
      .optional()
      .describe('Status of the lead to search for.'),
  }),
  run: async ({ configValue, connection, workspaceId, http }) => {
    const {
      email,
      firstName,
      lastName,
      company,
      phone,
      status,
      page,
      perPage,
    } = configValue;

    let query = '';
    if (email?.trim()) {
      query += `(Email:equals:${email})`;
    }
    if (firstName?.trim()) {
      query += `${query ? ' and ' : ''}(First_Name:equals:${firstName})`;
    }
    if (lastName?.trim()) {
      query += `${query ? ' and ' : ''}(Last_Name:equals:${lastName})`;
    }
    if (company?.trim()) {
      query += `${query ? ' and ' : ''}(Company:equals:${company})`;
    }
    if (phone?.trim()) {
      query += `${query ? ' and ' : ''}(Phone:equals:${phone})`;
    }
    if (status?.trim()) {
      query += `${query ? ' and ' : ''}(Lead_Status:equals:${status})`;
    }

    if (!query) {
      throw new Error('At least one search criteria must be provided.');
    }

    const url = `https://www.zohoapis.com/crm/v2/Leads/search?criteria=${encodeURIComponent(query)}&page=${page}&per_page=${perPage}`;

    const response = await http.request({
      method: 'GET',
      url,
      headers: {
        Authorization: `Zoho-oauthtoken ${connection.accessToken}`,
      },
      workspaceId,
    });

    return response.data;
  },
  mockRun: async () => ({
    data: [
      {
        Company: 'lead company',
        Email: 'test@test.com',
        Last_Activity_Time: '2024-09-05T11:44:54-06:00',
        Street: '123 Main St',
        Zip_Code: '12345',
        id: '0000006000000503001',
        Created_Time: '2024-09-05T11:42:28-06:00',
        City: 'Salt Lake City',
        No_of_Employees: 10,
        State: 'UT',
        Country: 'United States',
        First_Name: 'lead first name',
        Full_Name: 'lead first lead last name',
        Lead_Status: 'lead status',
        Phone: '0000000000',
        Email_Opt_Out: false,
        Modified_Time: '2024-09-05T11:44:54-06:00',
        Last_Name: 'lead last name',
        Locked__s: false,
      },
    ],
    info: {
      page: 1,
      count: 1,
      sort_by: 'id',
      per_page: 20,
      sort_order: 'desc',
      more_records: false,
    },
  }),
});

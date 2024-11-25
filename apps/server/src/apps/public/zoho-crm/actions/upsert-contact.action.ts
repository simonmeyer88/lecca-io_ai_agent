import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { ZohoCrm } from '../zoho-crm.app';
import { z } from 'zod';

export class UpsertContact extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: ZohoCrm;

  id() {
    return 'zoho-crm_action_upsert-contact';
  }

  name() {
    return 'Upsert Contact';
  }

  description() {
    return 'Create a new contact or update an existing contact.';
  }

  aiSchema() {
    return z.object({
      contactId: z
        .string()
        .nullable()
        .optional()
        .describe(
          'The ID of the contact to update, if exists. If not provided, a new contact will be created.',
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
    });
  }

  inputConfig(): InputConfig[] {
    return [
      {
        id: 'contactId',
        label: 'Contact ID',
        description: 'The ID of the contact you want to update (if exists).',
        inputType: 'text',
        placeholder: 'Enter the contact ID (optional)',
        occurenceType: 'single',
      },
      this.app.dynamicGetLeadFields(),
    ];
  }

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>) {
    const { contactId, fields } = configValue;

    const url = contactId?.trim()
      ? `https://www.zohoapis.com/crm/v2/Contacts/${contactId}`
      : `https://www.zohoapis.com/crm/v2/Contacts/upsert`;

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

    const method = contactId?.trim() ? 'put' : 'post';

    const response = await this.app.http.loggedRequest({
      method,
      url,
      data: requestBody,
      headers: {
        Authorization: `Zoho-oauthtoken ${connection.accessToken}`,
      },
      workspaceId,
    });

    if (response.data?.data?.[0]?.status === 'error') {
      throw new Error(JSON.stringify(response.data?.data));
    }

    return response.data;
  }

  async mockRun(): Promise<any> {
    return {
      data: [
        {
          action: 'insert',
          code: 'SUCCESS',
          status: 'success',
          details: {
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
          },
          message: 'record added',
          duplicate_field: null,
        },
      ],
    };
  }
}

type ConfigValue = z.infer<ReturnType<UpsertContact['aiSchema']>>;

import { Action } from '@/apps/lib/action';
import { Connection } from '@/apps/lib/connection';
import { Trigger } from '@/apps/lib/trigger';
import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { ZohoCrmOAuth2US } from './connections/zoho-crm.oauth';
import { AddUser } from './actions/add-user.action';
import { ListUsers } from './actions/list-users.action';
import { InputConfig } from '@/apps/lib/input-config';
import { DeleteUser } from './actions/delete-user.action';
import { UpsertLead } from './actions/upsert-lead.action';
import { SearchLeads } from './actions/search-lead.action';
import { UpsertContact } from './actions/upsert-contact.action';
import { NewContact } from './triggers/new-contact.trigger';
import { NewLead } from './triggers/new-lead.trigger';
import { ServerConfig } from '@/config/server.config';

export class ZohoCrm extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

  id = 'zoho-crm';
  name = 'Zoho CRM';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description =
    'Zoho CRM acts as a single repository to bring your sales, marketing, and customer support activities together.';
  isPublished = true;

  connections(): Connection[] {
    return [new ZohoCrmOAuth2US({ app: this })];
  }

  actions(): Action[] {
    return [
      new UpsertContact({ app: this }),
      new UpsertLead({ app: this }),
      new SearchLeads({ app: this }),
      new AddUser({ app: this }),
      new ListUsers({ app: this }),
      new DeleteUser({ app: this }),
    ];
  }

  triggers(): Trigger[] {
    return [new NewContact({ app: this }), new NewLead({ app: this })];
  }

  dynamicGetUsers(): InputConfig {
    return {
      id: 'userId',
      label: 'User',
      description: '',
      inputType: 'dynamic-select',
      _getDynamicValues: async ({ connection, workspaceId }) => {
        const url = `https://www.zohoapis.com/crm/v2/users?page=${1}&per_page=${200}`;

        const response = await this.http.loggedRequest({
          method: 'GET',
          url,
          headers: {
            Authorization: `Zoho-oauthtoken ${connection.accessToken}`,
          },
          workspaceId,
        });

        return response.data.users
          .filter((user: any) => user.status === 'active')
          .map((user: any) => ({
            value: user.id,
            label: `${user.first_name} ${user.last_name}`,
          }));
      },
      required: {
        missingMessage: 'User is required',
        missingStatus: 'warning',
      },
    };
  }

  dynamicGetLeadFields(): InputConfig {
    return {
      id: 'fields',
      label: 'Fields',
      description: 'Key-value pairs representing fields and their values',
      occurenceType: 'multiple',
      inputConfig: [
        {
          id: 'field',
          label: 'Field',
          description: '',
          inputType: 'dynamic-select',
          _getDynamicValues: async ({ connection, workspaceId }) => {
            const url =
              'https://www.zohoapis.com/crm/v2/settings/fields?module=Leads';

            const response = await this.http.loggedRequest({
              method: 'GET',
              url,
              headers: {
                Authorization: `Zoho-oauthtoken ${connection.accessToken}`,
              },
              workspaceId,
            });

            return response.data.fields
              .filter(
                (field: any) => field.read_only != true, // Filtering out read-only fields
              )
              .map((field: any) => {
                const fieldLabel = field.field_label.replace(/"/g, '_');
                const fieldName = field.api_name;

                return {
                  label: fieldLabel,
                  value: fieldName,
                };
              });
          },
          required: {
            missingMessage: 'Field is required',
            missingStatus: 'warning',
          },
        },
        {
          id: 'value',
          label: 'Value',
          description: '',
          inputType: 'text',
          placeholder: 'Add a value',
          required: {
            missingMessage: 'Value is required',
            missingStatus: 'warning',
          },
        },
      ],
    };
  }

  dynamicGetContactFields(): InputConfig {
    return {
      id: 'fields',
      label: 'Fields',
      description: 'Key-value pairs representing fields and their values',
      occurenceType: 'multiple',
      inputConfig: [
        {
          id: 'field',
          label: 'Field',
          description: '',
          inputType: 'dynamic-select',
          _getDynamicValues: async ({ connection, workspaceId }) => {
            const url =
              'https://www.zohoapis.com/crm/v2/settings/fields?module=Contacts';
            const response = await this.http.loggedRequest({
              method: 'GET',
              url,
              headers: {
                Authorization: `Zoho-oauthtoken ${connection.accessToken}`,
              },
              workspaceId,
            });

            return response.data.fields
              .filter(
                (field: any) => field.read_only != true, // Filtering out read-only fields
              )
              .map((field: any) => {
                const fieldLabel = field.field_label.replace(/"/g, '_');
                const fieldName = field.api_name;

                return {
                  label: fieldLabel,
                  value: fieldName,
                };
              });
          },
          required: {
            missingMessage: 'Field is required',
            missingStatus: 'warning',
          },
        },
        {
          id: 'value',
          label: 'Value',
          description: '',
          inputType: 'text',
          placeholder: 'Add a value',
          required: {
            missingMessage: 'Value is required',
            missingStatus: 'warning',
          },
        },
      ],
    };
  }
}

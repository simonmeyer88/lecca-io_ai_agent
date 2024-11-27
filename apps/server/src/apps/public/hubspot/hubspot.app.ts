import { Action } from '@/apps/lib/action';
import { App, AppContructorArgs } from '@/apps/lib/app';
import { Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { Trigger } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { AddContactToList } from './actions/add-contact-to-list.action';
import { CreateContact } from './actions/create-contact.action';
import { RemoveContactFromList } from './actions/remove-contact-from-list.action';
import { UpdateContact } from './actions/update-contact.action';
import { UpsertContact } from './actions/upsert-contact.action';
import { HubSpotOAuth2 } from './connections/hubspot.oauth2';

export class Hubspot extends App {
  constructor(args: AppContructorArgs) {
    super(args);
  }

  id = 'hubspot';
  name = 'HubSpot';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description =
    'HubSpot is a cloud-based platform that connects marketing, sales, and customer service tools into a single CRM database.';
  isPublished = true;

  connections(): Connection[] {
    return [new HubSpotOAuth2({ app: this })];
  }

  actions(): Action[] {
    return [
      new UpsertContact({ app: this }),
      new CreateContact({ app: this }),
      new UpdateContact({ app: this }),
      new AddContactToList({ app: this }),
      new RemoveContactFromList({ app: this }),
    ];
  }

  triggers(): Trigger[] {
    return [];
  }

  dynamicGetContactProperties(): InputConfig {
    return {
      id: 'properties',
      label: 'Properties',
      description: 'Key-value pairs representing fields and their values',
      occurenceType: 'multiple',
      inputConfig: [
        {
          id: 'field',
          label: 'Field',
          description: '',
          inputType: 'dynamic-select',
          _getDynamicValues: async ({ connection, workspaceId }) => {
            const url = 'https://api.hubapi.com/crm/v3/properties/contacts';

            const response = await this.http.loggedRequest({
              method: 'GET',
              url,
              headers: {
                Authorization: `Bearer ${connection.accessToken}`,
              },
              workspaceId,
            });

            return response.data.results
              .filter(
                (field: any) =>
                  field.modificationMetadata?.readOnlyValue != true,
              )
              .map((field: any) => {
                const fieldLabel = field.label.replace(/"/g, '_');
                const fieldName = field.name;

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

  dynamicGetStaticContactLists(): InputConfig {
    return {
      id: 'listId',
      label: 'List',
      description: 'The ID of the list to add the contact to',
      inputType: 'dynamic-select',
      placeholder: 'Select a static list',
      _getDynamicValues: async ({ connection, workspaceId }) => {
        const url = `https://api.hubapi.com/contacts/v1/lists`;

        const response = await this.http.loggedRequest({
          method: 'GET',
          url,
          headers: {
            Authorization: `Bearer ${connection.accessToken}`,
          },
          workspaceId,
        });

        return response.data.lists
          .filter(
            (list: any) =>
              list.dynamic === false &&
              list.archived === false &&
              list.readOnly === false,
          )
          .map((list: any) => ({
            label: list.name,
            value: list.listId,
          }));
      },
      required: {
        missingMessage: 'List ID is required',
        missingStatus: 'warning',
      },
    };
  }

  verifyWebhookRequest({
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    webhookBody,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    webhookHeaders,
  }: {
    webhookBody: unknown;
    webhookHeaders: Record<string, string>;
  }) {
    //Not implemented yet
    return false;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  parseWebhookEventType({ webhookBody }: { webhookBody: any }) {
    return {
      //   event: webhookBody?.event?.type ?? '',
      event: 'todo',
    };
  }
}

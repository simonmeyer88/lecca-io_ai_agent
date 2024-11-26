import { Client } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

import { Action } from '@/apps/lib/action';
import { Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { Trigger } from '@/apps/lib/trigger';
import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { ServerConfig } from '@/config/server.config';

import { AddDatabaseItem } from './actions/add-database-item.action';
import { AppendPage } from './actions/append-to-page.action';
import { CreatePage } from './actions/create-page.action';
import { GetDatabase } from './actions/get-database.action';
import { GetPage } from './actions/get-page.action';
import { ListDatabases } from './actions/list-databases.action';
import { UpdateDatabaseItem } from './actions/update-database-item.action';
import { NotionOAuth2 } from './connections/notion.oauth2';
import { NewDatabaseItem } from './triggers/new-database-item.trigger';
import { PageUpdated } from './triggers/page-updated.trigger';
import { UpdatedDatabaseItem } from './triggers/updated-database-item.trigger';

export class Notion extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

  id = 'notion';
  name = 'Notion';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description =
    'Notion is a single space where you can think, write, and plan.';
  isPublished = true;

  connections(): Connection[] {
    return [new NotionOAuth2({ app: this })];
  }

  actions(): Action[] {
    return [
      new AddDatabaseItem({ app: this }),
      new UpdateDatabaseItem({ app: this }),
      new CreatePage({ app: this }),
      new AppendPage({ app: this }),
      new GetPage({ app: this }),
      new ListDatabases({ app: this }),
      new GetDatabase({ app: this }),
    ];
  }

  triggers(): Trigger[] {
    return [
      new PageUpdated({ app: this }),
      new NewDatabaseItem({ app: this }),
      new UpdatedDatabaseItem({ app: this }),
    ];
  }

  notionLib({ accessToken }: { accessToken: string }) {
    const notion = new Client({
      auth: accessToken,
    });
    return notion;
  }

  dynamicSelectDatabase(): InputConfig {
    return {
      id: 'databaseId',
      label: 'Database',
      description: 'Select a database',
      inputType: 'dynamic-select',
      required: {
        missingMessage: 'Database is required',
        missingStatus: 'warning',
      },
      _getDynamicValues: async ({ connection }) => {
        const notionLib = this.notionLib({
          accessToken: connection.accessToken,
        });

        const databases = await notionLib.search({
          filter: {
            property: 'object',
            value: 'database',
          },
          sort: {
            direction: 'descending',
            timestamp: 'last_edited_time',
          },
        });

        return databases.results?.map((db) => {
          return {
            label: ((db as any).title as DBNotionTitle)?.[0]?.plain_text ?? '-',
            value: db.id,
          };
        });
      },
    };
  }

  dynamicSelectPageInDatabase(): InputConfig {
    return {
      id: 'page',
      label: 'Page',
      description: 'Select a page by ID',
      inputType: 'dynamic-select',
      loadOptions: {
        dependsOn: ['databaseId'],
        forceRefresh: true,
      },
      required: {
        missingMessage: 'Page is required',
        missingStatus: 'warning',
      },
      _getDynamicValues: async ({ connection, extraOptions }) => {
        const notionLib = this.notionLib({
          accessToken: connection.accessToken,
        });

        const databaseId = extraOptions?.databaseId;

        if (databaseId === undefined) {
          throw new Error('Database ID is required');
        }

        const pages = await notionLib.databases.query({
          database_id: databaseId,
        });

        return pages.results?.map((page) => {
          return {
            label:
              (page as any).properties.Name?.title[0]?.plain_text ??
              (page as any).properties.title?.title[0]?.text?.content ??
              '-',
            value: page.id,
          };
        });
      },
    };
  }

  dynamicSelectPropertiesInPage(): InputConfig {
    return {
      id: 'properties',
      label: 'Properties',
      description: 'Select properties to update',
      occurenceType: 'multiple',
      inputConfig: [
        {
          id: 'key',
          label: 'Property Name',
          description: 'Select properties to update',
          inputType: 'dynamic-select',
          loadOptions: {
            dependsOn: ['page'],
            forceRefresh: true,
          },
          required: {
            missingMessage: 'Properties are required',
            missingStatus: 'warning',
          },
          _getDynamicValues: async ({ connection, extraOptions }) => {
            const notionLib = this.notionLib({
              accessToken: connection.accessToken,
            });

            const pageId = extraOptions?.page;

            if (pageId === undefined) {
              throw new Error('Page is required');
            }

            const page = await notionLib.pages.retrieve({
              page_id: pageId,
            });

            const properties = Object.keys(
              (page as PageObjectResponse).properties,
            ).map((key) => {
              return {
                label: key,
                value: key,
              };
            });

            return properties;
          },
        },
        {
          id: 'value',
          label: 'Value',
          description: 'Enter the new value for the property',
          placeholder: 'Enter the new value',
          inputType: 'text',
        },
      ],
    };
  }

  dynamicSelectPage(): InputConfig {
    return {
      id: 'page',
      label: 'Page',
      description: 'Select a page ID.',
      inputType: 'dynamic-select',
      required: {
        missingMessage: 'Page is required',
        missingStatus: 'warning',
      },
      _getDynamicValues: async ({ connection }) => {
        const notionLib = this.notionLib({
          accessToken: connection.accessToken,
        });

        const pages = await notionLib.search({
          filter: {
            property: 'object',
            value: 'page',
          },
          sort: {
            direction: 'descending',
            timestamp: 'last_edited_time',
          },
        });

        return pages.results?.map((page) => {
          return {
            label:
              (page as any).properties.Name?.title[0]?.plain_text ??
              (page as any).properties.title?.title[0]?.text?.content ??
              '-',
            value: page.id,
          };
        });
      },
    };
  }

  dynamicGetDatabaseProperties(): InputConfig {
    return {
      id: 'properties',
      label: 'Properties',
      description: 'Enter the properties for the new database item',
      inputType: 'map',
      mapOptions: {
        disableKeyInput: true,
      },
      occurenceType: 'dynamic',
      loadOptions: {
        dependsOn: ['databaseId'],
        forceRefresh: true,
      },
      required: {
        missingMessage: 'Please provide properties for the database item',
        missingStatus: 'warning',
      },
      _getDynamicValues: async ({ connection, extraOptions }) => {
        const notionLib = this.notionLib({
          accessToken: connection.accessToken,
        });

        const databaseId = extraOptions?.databaseId;

        if (databaseId === undefined) {
          throw new Error('Database ID is required');
        }

        const database = await notionLib.databases.retrieve({
          database_id: databaseId,
        });

        return Object.entries(database.properties).map(([key]) => {
          return {
            label: key,
            value: '',
          };
        });
      },
    };
  }

  async buildPropertyMappingsForDatabase({
    databaseId,
    properties,
    notionLib,
  }: {
    databaseId: string;
    properties: { key: string; value: string }[];
    notionLib: Client;
  }) {
    const database = await notionLib.databases.retrieve({
      database_id: databaseId,
    });

    const notionDatabaseProperties = database.properties;

    //We want to match the properties key to the database properties key.

    const propertyMappings: Record<string, any> = {};
    properties.forEach(({ key, value }) => {
      const databaseProperty = notionDatabaseProperties[key];

      if (databaseProperty === undefined) {
        throw new Error(
          `${key} is not a valid property for the notion database`,
        );
      }

      if (value != null && value != '') {
        switch (databaseProperty.type) {
          case 'checkbox':
            propertyMappings[key] = { checkbox: value };
            break;
          case 'date':
            propertyMappings[key] = { date: { start: value } };
            break;
          case 'email':
            propertyMappings[key] = { email: value };
            break;
          case 'select':
            propertyMappings[key] = { select: { name: value } };
            break;
          case 'multi_select':
            propertyMappings[key] = { multi_select: [{ name: value }] };
            break;
          case 'status':
            propertyMappings[key] = { status: { name: value } };
            break;
          case 'number':
            propertyMappings[key] = { number: Number(value) };
            break;
          case 'phone_number':
            propertyMappings[key] = { phone_number: value };
            break;
          case 'rich_text':
            propertyMappings[key] = {
              rich_text: [{ type: 'text', text: { content: value } }],
            };
            break;
          case 'title':
            propertyMappings[key] = {
              title: [{ type: 'text', text: { content: value } }],
            };
            break;
          case 'url':
            propertyMappings[key] = { url: value };
            break;
          case 'people':
            propertyMappings[key] = { people: [{ object: 'user', id: value }] };
            break;
          case 'formula':
            propertyMappings[key] = { formula: { expression: value } };
            break;
          default:
            throw new Error(
              `Property type ${databaseProperty.type} not supported. If you see this error, please contact support. Should not happen.`,
            );
        }
      }
    });

    return propertyMappings;
  }

  getOAuth2Client() {
    const notion = new Client();
    return notion;
  }
}

type DBNotionTitle = {
  type: 'text';
  text: unknown;
  annotations: unknown;
  plain_text: string;
  href: null | string;
}[];

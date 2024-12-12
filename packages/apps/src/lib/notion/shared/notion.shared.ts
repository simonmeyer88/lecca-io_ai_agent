import {
  FieldConfig,
  createDynamicSelectInputField,
  createNestedFields,
} from '@lecca-io/toolkit';
import { Client } from '@notionhq/client';
import { PageObjectResponse } from '@notionhq/client/build/src/api-endpoints';

export const shared = {
  fields: {
    dynamicSelectDatabase: createDynamicSelectInputField({
      id: 'databaseId',
      label: 'Database',
      description: 'Select a database',
      required: {
        missingMessage: 'Database is required',
        missingStatus: 'warning',
      },
      _getDynamicValues: async ({ connection }) => {
        const notionLib = shared.notionLib({
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
    }),
    dynamicSelectPageInDatabase: createDynamicSelectInputField({
      id: 'page',
      label: 'Page',
      description: 'Select a page by ID',
      loadOptions: {
        dependsOn: ['databaseId'],
        forceRefresh: true,
      },
      required: {
        missingMessage: 'Page is required',
        missingStatus: 'warning',
      },
      _getDynamicValues: async ({ connection, extraOptions }) => {
        const notionLib = shared.notionLib({
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
    }),
    dynamicSelectPropertiesInPage: createNestedFields({
      id: 'properties',
      label: 'Properties',
      description: 'Select properties to update',
      occurenceType: 'multiple',
      fields: [
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
            const notionLib = shared.notionLib({
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
    }),
    dynamicSelectPage: createDynamicSelectInputField({
      id: 'page',
      label: 'Page',
      description: 'Select a page ID.',
      required: {
        missingMessage: 'Page is required',
        missingStatus: 'warning',
      },
      _getDynamicValues: async ({ connection }) => {
        const notionLib = shared.notionLib({
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
    }),
    dynamicGetDatabaseProperties: {
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
        const notionLib = shared.notionLib({
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
    } as FieldConfig,
  },
  buildPropertyMappingsForDatabase: async ({
    databaseId,
    properties,
    notionLib,
  }: {
    databaseId: string;
    properties: { key: string; value: string }[];
    notionLib: Client;
  }) => {
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
  },
  notionLib({ accessToken }: { accessToken: string }) {
    const notion = new Client({
      auth: accessToken,
    });
    return notion;
  },
};

type DBNotionTitle = {
  type: 'text';
  text: unknown;
  annotations: unknown;
  plain_text: string;
  href: null | string;
}[];

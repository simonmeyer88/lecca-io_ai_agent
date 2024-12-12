import {
  createDynamicSelectInputField,
  createNestedFields,
} from '@lecca-io/toolkit';

export const shared = {
  fields: {
    dynamicGetUsers: createDynamicSelectInputField({
      id: 'userId',
      label: 'User',
      description: '',
      _getDynamicValues: async ({ connection, workspaceId, http }) => {
        const url = `https://www.zohoapis.com/crm/v2/users?page=${1}&per_page=${200}`;

        const response = await http.request({
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
    }),
    dynamicGetLeadFields: createNestedFields({
      id: 'fields',
      label: 'Fields',
      description: 'Key-value pairs representing fields and their values',
      fields: [
        {
          id: 'field',
          label: 'Field',
          description: '',
          inputType: 'dynamic-select',
          _getDynamicValues: async ({ connection, workspaceId, http }) => {
            const url =
              'https://www.zohoapis.com/crm/v2/settings/fields?module=Leads';

            const response = await http.request({
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
    }),
    dynamicGetContactFields: createNestedFields({
      id: 'fields',
      label: 'Fields',
      description: 'Key-value pairs representing fields and their values',
      fields: [
        {
          id: 'field',
          label: 'Field',
          description: '',
          inputType: 'dynamic-select',
          _getDynamicValues: async ({ connection, workspaceId, http }) => {
            const url =
              'https://www.zohoapis.com/crm/v2/settings/fields?module=Contacts';
            const response = await http.request({
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
    }),
  },
};

import {
  createDynamicSelectInputField,
  createNestedFields,
  createTextInputField,
} from '@lecca-io/toolkit';

export const shared = {
  fields: {
    dynamicGetContactProperties: createNestedFields({
      id: 'properties',
      label: 'Properties',
      description: 'Key-value pairs representing fields and their values',
      occurenceType: 'multiple',
      fields: [
        createDynamicSelectInputField({
          id: 'field',
          label: 'Field',
          description: '',
          _getDynamicValues: async ({ connection, workspaceId, http }) => {
            const url = 'https://api.hubapi.com/crm/v3/properties/contacts';

            const response = await http.request({
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
        }),
        createTextInputField({
          id: 'value',
          label: 'Value',
          description: '',
          placeholder: 'Add a value',
          required: {
            missingMessage: 'Value is required',
            missingStatus: 'warning',
          },
        }),
      ],
    }),
    dynamicGetStaticContactLists: createDynamicSelectInputField({
      id: 'listId',
      label: 'List',
      description: 'The ID of the list to add the contact to',
      placeholder: 'Select a static list',
      _getDynamicValues: async ({ connection, workspaceId, http }) => {
        const url = `https://api.hubapi.com/contacts/v1/lists`;

        const response = await http.request({
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
    }),
  },
};

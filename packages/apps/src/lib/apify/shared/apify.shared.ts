import { FieldConfig, createDynamicSelectInputField } from '@lecca-io/toolkit';

export const shared = {
  fields: {
    dynamicListTasks: createDynamicSelectInputField({
      id: 'taskId',
      label: 'Task',
      description: 'The ID of the Apify task to run',
      _getDynamicValues: async ({ connection, workspaceId, http }) => {
        const url = `https://api.apify.com/v2/actor-tasks`;

        const result = await http.request({
          method: 'GET',
          url,
          headers: {
            Authorization: `Bearer ${connection.apiKey}`,
          },
          workspaceId,
        });

        return (
          result.data?.data?.items?.map((item: any) => {
            return {
              value: item.id,
              label: item.name,
            };
          }) ?? []
        );
      },
    }),
    dynamicListTaskInputSchema: {
      id: 'schema',
      label: 'Input Schema Overrides',
      description:
        'The input schema fields you want to override for your task. If you do not enter a value for a property, the default schema value will be used.',
      occurenceType: 'dynamic',
      loadOptions: {
        dependsOn: [
          'taskId',
          {
            id: 'showSchemaMap',
            value: 'true',
          },
        ],
      },
      inputType: 'map',
      _getDynamicValues: async ({
        connection,
        extraOptions,
        workspaceId,
        http,
      }) => {
        const { taskId } = extraOptions;

        if (taskId == null) {
          throw new Error('Task ID is required to retrieve schema fields');
        }

        const url = `https://api.apify.com/v2/actor-tasks/${taskId}/input`;

        const result = await http.request({
          method: 'GET',
          url,
          headers: {
            Authorization: `Bearer ${connection.apiKey}`,
          },
          workspaceId,
        });

        const schema = result?.data ?? {};

        return Object.keys(schema).map((key) => {
          return {
            label: key,
            value: key,
          };
        });
      },
    } as FieldConfig,
  },
};

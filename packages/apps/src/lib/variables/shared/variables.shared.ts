import { createDynamicSelectInputField } from '@lecca-io/toolkit';

export const shared = {
  fields: {
    dynamicGetVariable: createDynamicSelectInputField({
      id: 'variableId',
      label: 'Variable ID',
      description:
        'Retrieve a variable by its ID. Only variables available to the project can be retrieved.',
      required: {
        missingStatus: 'warning',
        missingMessage: 'Please provide a variable ID',
      },
      _getDynamicValues: async ({ projectId, workspaceId, prisma }) => {
        const variables = await prisma.variable.findMany({
          where: {
            OR: [
              {
                FK_projectId: projectId,
              },
              {
                AND: [
                  {
                    FK_workspaceId: workspaceId,
                  },
                  {
                    FK_projectId: null,
                  },
                ],
              },
            ],
          },
          select: {
            id: true,
            name: true,
          },
        });

        return variables.map((variable) => ({
          label: variable.name,
          value: variable.id,
        }));
      },
    }),
  },
};

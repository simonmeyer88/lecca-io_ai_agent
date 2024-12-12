import { createAction, createDynamicSelectInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const getVariable = createAction({
  id: 'variables_action_get-variables',
  name: 'Get Variable',
  description: 'Retrieve a variable by its ID.',
  inputConfig: [
    createDynamicSelectInputField({
      id: 'variableId',
      label: 'Variable',
      description: 'Select a variable',
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
      required: {
        missingMessage: 'Please select a variable',
        missingStatus: 'warning',
      },
    }),
  ],
  aiSchema: z.object({
    variableId: z
      .string()
      .describe('Variable ID. If you do not have the ID, please ask for it.'),
  }),
  run: async ({ configValue, projectId, workspaceId, prisma }) => {
    if (!configValue.variableId) {
      throw new Error('Variable ID is required');
    }

    const variable = await prisma.variable.findFirst({
      where: {
        AND: [
          { id: configValue.variableId },
          {
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
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        value: true,
      },
    });

    if (!variable) {
      throw new Error('Variable not found');
    }

    return {
      variable,
    };
  },
  mockRun: async () => {
    return {
      variable: {
        id: '1',
        name: 'Variable 1',
        description: 'This is a variable',
        value: 'This can be text, number, boolean, or data',
      },
    };
  },
});

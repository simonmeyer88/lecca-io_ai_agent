import { createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

export const listVariables = createAction({
  id: 'variables_action_list-variables',
  name: 'List Variables',
  description: 'Lists all variables available to the project.',
  inputConfig: [
    {
      id: 'markdown',
      inputType: 'markdown',
      label: '',
      description: '',
      markdown:
        "Lists all AI agents available to the project. This includes this project's variables and workspace variables.",
    },
  ],
  aiSchema: z.object({}),
  run: async ({ projectId, workspaceId, prisma }) => {
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
        description: true,
        value: true,
      },
    });

    return {
      variables: variables.map((variable) => ({
        id: variable.id,
        name: variable.name,
        description: variable.description,
        value: variable.value as any,
      })),
    };
  },

  mockRun: async () => {
    return {
      variables: [
        {
          id: '1',
          name: 'Variable 1',
          description: 'This is a variable',
          value: true,
        },
        {
          id: '2',
          name: 'Variable 2',
          description: 'This is another variable',
          value: 'This is a variable value',
        },
      ],
    };
  },
});

import { createAction, createMarkdownField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const listAgents = createAction({
  id: 'agents_action_list-agents',
  name: 'List Agents',
  description: 'Lists all AI agents available to the project.',
  inputConfig: [
    createMarkdownField({
      id: 'markdown',
      markdown: 'Lists all AI agents available to the project.',
    }),
  ],
  aiSchema: z.object({}),
  run: async ({ projectId, prisma }) => {
    const projectAgents = await prisma.agent.findMany({
      where: {
        FK_projectId: projectId,
      },
      select: {
        id: true,
        name: true,
        description: true,
      },
    });

    return {
      agents: projectAgents.map((agent) => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
      })),
    };
  },
  mockRun: async () => {
    return {
      agents: [
        {
          id: '1',
          name: 'Agent 1',
          description: 'This is a agent',
        },
        {
          id: '2',
          name: 'Agent 2',
          description: 'This is another agent',
        },
      ],
    };
  },
});

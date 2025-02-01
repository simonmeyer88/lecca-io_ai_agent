import { createDynamicSelectInputField } from '@lecca-io/toolkit';

export const shared = {
  fields: {
    dynamicSelectAgent: createDynamicSelectInputField({
      id: 'agentId',
      label: 'Agent',
      description: 'Select an agent from the project.',
      placeholder: 'Select an agent',
      _getDynamicValues: async ({ prisma, projectId, agentId }) => {
        const projectAgents = await prisma.agent.findMany({
          where: {
            FK_projectId: projectId,
          },
          select: {
            id: true,
            name: true,
          },
        });

        if (agentId) {
          return projectAgents
            .filter((agent) => agent.id !== agentId)
            .map((agent) => ({
              label: agent.name,
              value: agent.id,
            }));
        }
        return projectAgents.map((agent) => ({
          label: agent.name,
          value: agent.id,
        }));
      },
    }),
  },
};

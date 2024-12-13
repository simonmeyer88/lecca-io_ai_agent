import { createAction, createMarkdownField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const listKnowledge = createAction({
  id: 'knowledge_action_list-knowledge',
  name: 'List Knowledge Notebooks',
  description: 'Lists all knowledge notebooks available to the project.',
  iconUrl: `https://lecca-io.s3.us-east-2.amazonaws.com/assets/actions/knowledge_action_search-knowledge.svg`,
  inputConfig: [
    createMarkdownField({
      id: 'markdown',
      markdown:
        "Lists all knowledge notebooks available to the project. This includes this project's notebooks and workspace notebooks.",
    }),
  ],
  aiSchema: z.object({}),
  run: async ({ projectId, workspaceId, prisma }) => {
    const notebooks = await prisma.knowledge.findMany({
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
      },
    });

    return {
      notebooks: notebooks.map((notebook) => ({
        id: notebook.id,
        name: notebook.name,
        description: notebook.description,
      })),
    };
  },

  mockRun: async () => {
    return {
      notebooks: [
        {
          id: '1',
          name: 'Notebook 1',
          description: 'This is a notebook',
        },
        {
          id: '2',
          name: 'Notebook 2',
          description: 'This is another notebook',
        },
      ],
    };
  },
});

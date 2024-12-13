import {
  createAction,
  createDynamicSelectInputField,
  createNumberInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

export const saveToKnowledge = createAction({
  id: 'knowledge_action_save-to-knowledge',
  name: 'Save to Knowledge',
  description: 'Saves text to a knowledge notebook',
  needsConnection: false,
  iconUrl: `https://lecca-io.s3.us-east-2.amazonaws.com/assets/actions/knowledge_action_search-knowledge.svg`,

  inputConfig: [
    createDynamicSelectInputField({
      id: 'knowledgeId',
      label: 'Knowledge Notebook',
      description: 'The knowledge notebook to save the text data to',
      placeholder: 'Select a notebook',
      _getDynamicValues: async ({ projectId, workspaceId, prisma }) => {
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
          },
        });

        return notebooks.map((notebook) => ({
          label: notebook.name,
          value: notebook.id,
        }));
      },
      required: {
        missingMessage: 'Knowledge notebook is required',
        missingStatus: 'warning',
      },
    }),
    createTextInputField({
      id: 'name',
      label: 'Name',
      description: 'The name of the data entry helpful for searching',
      placeholder: 'Add a name',
      required: {
        missingMessage: 'Name is required',
        missingStatus: 'warning',
      },
    }),
    createTextInputField({
      id: 'data',
      label: 'Data',
      description: 'The data to save to the knowledge notebook',
      placeholder: 'Add data to save',
      required: {
        missingMessage: 'Data is required',
        missingStatus: 'warning',
      },
    }),
    createNumberInputField({
      id: 'chunkSize',
      label: 'Chunk Size',
      description:
        'The size of the chunks to chunk the text data into. This is used for breaking the data into smaller pieces. Maximum is 2000.',
      placeholder: 'Defaults to 1000',
      numberOptions: {
        min: 100,
        max: 2000,
        step: 1,
      },
    }),
    createNumberInputField({
      id: 'chunkOverlap',
      label: 'Chunk Overlap %',
      description:
        'The size of the chunk overlap. This is useful for ensuring context is not lost between chunks. Maxiumum is 50%.',
      placeholder: 'Defaults to 10%',
      numberOptions: {
        min: 0,
        max: 50,
        step: 1,
      },
    }),
  ],

  aiSchema: z.object({
    knowledgeId: z
      .string()
      .describe('The knowledge notebook ID to save the text data to.'),
    chunkOverlap: z
      .number()
      .describe(
        'The size of the chunk overlap. This is useful for ensuring context is not lost between chunks. Maxiumum is 50%.',
      ),
    data: z
      .string()
      .min(1)
      .describe('The data to save to the knowledge notebook'),
    name: z
      .string()
      .min(1)
      .describe('The name of the data entry helpful for searching'),
    chunkSize: z
      .number()
      .min(100)
      .max(2000)
      .nullable()
      .optional()
      .describe('The size of the chunks to chunk the text data into.'),
  }),

  run: async ({ configValue, projectId, workspaceId, prisma, knowledge }) => {
    if (!configValue.data) {
      throw new Error('Data is required to save to the knowledge notebook');
    }

    const knowledgeExistsInProject = await prisma.knowledge.findFirst({
      where: {
        AND: [
          {
            id: configValue.knowledgeId,
          },
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
      },
    });

    if (!knowledgeExistsInProject) {
      throw new Error(
        `Knowledge notebook does not exist in this project: ${configValue.knowledgeId}`,
      );
    }

    await knowledge.saveUploadedTextToKnowledge({
      data: {
        text: configValue.data,
        name: configValue.name,
        chunkOverlap:
          (configValue.chunkOverlap ?? configValue.chunkSize)
            ? configValue.chunkSize * 0.1
            : undefined,
        chunkSize: configValue.chunkSize ?? undefined,
      },
      knowledgeId: configValue.knowledgeId,
      workspaceId,
    });

    return {
      dataSaved: true,
    };
  },

  mockRun: async () => {
    return {
      dataSaved: true,
    };
  },
});

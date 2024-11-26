import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { Knowledge } from '../knowledge.app';

export class SaveToKnowledge extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Knowledge;
  id() {
    return 'knowledge_action_save-to-knowledge';
  }
  needsConnection() {
    return false;
  }
  name() {
    return 'Save to Knowledge';
  }
  iconUrl(): null | string {
    return `${ServerConfig.INTEGRATION_ICON_BASE_URL}/actions/${`knowledge_action_search-knowledge`}.svg`;
  }
  description() {
    return 'Saves text to a knowledge notebook';
  }
  aiSchema() {
    return z.object({
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
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        id: 'knowledgeId',
        label: 'Knowledge Notebook',
        description: 'The knowledge notebook to save the text data to',
        placeholder: 'Select a notebook',
        inputType: 'dynamic-select',
        _getDynamicValues: async ({ projectId, workspaceId }) => {
          const notebooks = await this.app.prisma.knowledge.findMany({
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
      },
      {
        id: 'name',
        label: 'Name',
        description: 'The name of the data entry helpful for searching',
        inputType: 'text',
        placeholder: 'Add a name',
        required: {
          missingMessage: 'Name is required',
          missingStatus: 'warning',
        },
      },
      {
        id: 'data',
        label: 'Data',
        description: 'The data to save to the knowledge notebook',
        inputType: 'text',
        required: {
          missingMessage: 'Data is required',
          missingStatus: 'warning',
        },
        placeholder: 'Add data to save',
      },
      {
        id: 'chunkSize',
        label: 'Chunk Size',
        description:
          'The size of the chunks to chunk the text data into. This is used for breaking the data into smaller pieces. Maximum is 2000.',
        inputType: 'number',
        numberOptions: {
          min: 100,
          max: 2000,
          step: 1,
        },
        placeholder: 'Defaults to 1000',
      },
      {
        id: 'chunkOverlap',
        label: 'Chunk Overlap %',
        description:
          'The size of the chunk overlap. This is useful for ensuring context is not lost between chunks. Maxiumum is 50%.',
        numberOptions: {
          min: 0,
          max: 50,
          step: 1,
        },
        inputType: 'number',
        placeholder: 'Defaults to 10%',
      },
    ];
  }

  async run({
    configValue,
    projectId,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
    if (!configValue.data) {
      throw new Error('Data is required to save to the knowledge notebook');
    }

    //Verify that chunkoverlap is not greater than 100. Or greater than 50%

    // Verify that the notebook belongs to the project
    const knowledgeExistsInProject = await this.app.prisma.knowledge.findFirst({
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

    await this.app.knowledge.saveUploadedTextToKnowledge({
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
  }

  async mockRun(): Promise<Response> {
    return {
      dataSaved: true,
    };
  }
}

type ConfigValue = z.infer<ReturnType<SaveToKnowledge['aiSchema']>> & {
  knowledgeId: string;
  chunkOverlap: number;
};

type Response = {
  dataSaved: true;
};

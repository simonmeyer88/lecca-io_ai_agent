import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { Knowledge } from '../knowledge.app';

export class SearchKnowledge extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Knowledge;
  needsConnection = false;
  id = `knowledge_action_search-knowledge`;
  name = 'Search Knowledge';
  iconUrl: null | string =
    `${ServerConfig.INTEGRATION_ICON_BASE_URL}/actions/${this.id}.svg`;
  description = 'Search your knowledge notebooks.';
  aiSchema = z.object({
    knowledgeId: z.string().describe('The knowledge notebook ID to search.'),
    searchQuery: z
      .string()
      .min(1)
      .describe('The text to query the knowledge notebook (vector database).'),
    shouldLimit: z
      .enum(['true', 'false'])
      .describe('Whether to limit the number of results returned.'),
    limit: z
      .number()
      .min(1)
      .nullable()
      .optional()
      .describe('The number of maximum results to return. Default is 3.'),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'knowledgeId',
      label: 'Noteboook',
      inputType: 'dynamic-select',
      description: 'The knowledge notebook to to query for knowledge.',
      placeholder: 'Select a notebook',
      hideCustomTab: true,
      _getDynamicValues: async ({ workspaceId, projectId }) => {
        const projectKnowledge = await this.app.prisma.knowledge.findMany({
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

        return projectKnowledge.map((knowledge) => ({
          label: knowledge.name,
          value: knowledge.id,
        }));
      },
      required: {
        missingMessage: 'Knowledge notebook is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'searchQuery',
      inputType: 'text',
      label: 'Search Query',
      description: 'The search query to find information in the notebook.',
      required: {
        missingMessage: 'Search query is required',
        missingStatus: 'warning',
      },
      placeholder: 'Add a search query',
    },
    {
      id: 'shouldLimit',
      inputType: 'switch',
      label: 'Limit Results? The default limit is 3.',
      description: '',
      switchOptions: {
        checked: 'true',
        unchecked: 'false',
        defaultChecked: false,
      },
    },
    {
      id: 'limit',
      inputType: 'number',
      label: 'Limit',
      description:
        'The number of maximum results to return. There may be less results returned if there are less results available.',
      placeholder: 'Add a limit',
      loadOptions: {
        dependsOn: [
          {
            id: 'shouldLimit',
            value: 'true',
          },
        ],
      },
    },
  ];

  async run({
    configValue,
    projectId,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
    if (!configValue.searchQuery) {
      throw new Error(`No search query was provided to search for knowledge.`);
    }

    //Verify that the knowledge belongs to the project or workspace
    const knowledgeExistsInProjectOrWorkspace =
      await this.app.prisma.knowledge.findFirst({
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

    if (!knowledgeExistsInProjectOrWorkspace) {
      throw new Error(
        `Knowledge does exist in this project or workspace: ${configValue.knowledgeId}`,
      );
    }

    //Search knowledge here..
    const contextFromKnowledge = await this.app.knowledge.queryKnowledge({
      knowledgeId: configValue.knowledgeId,
      query: configValue.searchQuery,
      limit:
        configValue.shouldLimit === 'true'
          ? configValue.limit != null
            ? Number(configValue.limit)
            : undefined
          : undefined,
      workspaceId,
    });

    return {
      results: contextFromKnowledge ?? [],
    };
  }

  async mockRun(): Promise<Response> {
    return {
      results: ['result 1', 'result 2', 'result 3'],
    };
  }
}

type Response = {
  results: string[];
};

type ConfigValue = z.infer<SearchKnowledge['aiSchema']>;

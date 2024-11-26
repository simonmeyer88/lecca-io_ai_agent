import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { Knowledge } from '../knowledge.app';

export class ListKnowledge extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Knowledge;
  id() {
    return 'knowledge_action_list-knowledge';
  }
  needsConnection() {
    return false;
  }
  name() {
    return 'List Knowledge Notebooks';
  }
  iconUrl(): null | string {
    return `${ServerConfig.INTEGRATION_ICON_BASE_URL}/actions/${`knowledge_action_search-knowledge`}.svg`;
  }
  description() {
    return 'Lists all knowledge notebooks available to the project.';
  }

  aiSchema() {
    return z.object({});
  }
  inputConfig(): InputConfig[] {
    return [
      {
        id: 'markdown',
        inputType: 'markdown',
        label: '',
        description: '',
        markdown:
          "Lists all knowledge notebooks available to the project. This includes this project's notebooks and workspace notebooks.",
      },
    ];
  }

  async run({
    projectId,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
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
  }

  async mockRun(): Promise<Response> {
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
  }
}

type ConfigValue = z.infer<ReturnType<ListKnowledge['aiSchema']>>;

type Response = {
  notebooks: {
    id: string;
    name: string;
    description: string;
  }[];
};

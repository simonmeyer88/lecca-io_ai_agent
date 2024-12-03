import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { AI } from '../ai.app';

export class ListAgents extends Action {
  app: AI;
  id = 'ai_action_list-agents';
  needsConnection = false;
  name = 'List Agents';
  iconUrl: null | string =
    `${ServerConfig.INTEGRATION_ICON_BASE_URL}/actions/${`ai_action_message-agent`}.svg`;
  description = 'Lists all AI agents available to the project.';
  aiSchema = z.object({});
  inputConfig: InputConfig[] = [
    {
      id: 'markdown',
      inputType: 'markdown',
      label: '',
      description: '',
      markdown: 'Lists all AI agents available to the project.',
    },
  ];

  async run({ projectId }: RunActionArgs<ConfigValue>): Promise<Response> {
    const projectAgents = await this.app.prisma.agent.findMany({
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
  }

  async mockRun(): Promise<Response> {
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
  }
}

type ConfigValue = z.infer<ListAgents['aiSchema']>;

type Response = {
  agents: {
    id: string;
    name: string;
    description: string;
  }[];
};

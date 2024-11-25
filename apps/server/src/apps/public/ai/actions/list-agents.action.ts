import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { z } from 'zod';
import { AI } from '../ai.app';
import { ServerConfig } from '@/config/server.config';

export class ListAgents extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: AI;
  id() {
    return 'ai_action_list-agents';
  }
  needsConnection() {
    return false;
  }
  name() {
    return 'List Agents';
  }
  iconUrl(): null | string {
    return `${ServerConfig.INTEGRATION_ICON_BASE_URL}/actions/${`ai_action_message-agent`}.svg`;
  }
  description() {
    return 'Lists all AI agents available to the project.';
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
        markdown: 'Lists all AI agents available to the project.',
      },
    ];
  }

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

type ConfigValue = z.infer<ReturnType<ListAgents['aiSchema']>>;

type Response = {
  agents: {
    id: string;
    name: string;
    description: string;
  }[];
};

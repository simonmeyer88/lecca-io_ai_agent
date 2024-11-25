import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { z } from 'zod';
import { AI } from '../ai.app';
import { ServerConfig } from '@/config/server.config';
import { v4 } from 'uuid';

export class MessageAgent extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: AI;
  needsConnection(): boolean {
    return false;
  }
  id() {
    return `ai_action_message-agent`;
  }
  name() {
    return 'Message Agent';
  }
  iconUrl(): null | string {
    return `${ServerConfig.INTEGRATION_ICON_BASE_URL}/actions/${this.id()}.svg`;
  }
  description() {
    return 'Message one of your agents.';
  }

  aiSchema() {
    return z.object({
      data: z.string().min(1).describe('The data to forward to the agent'),
      customIdentifier: z
        .string()
        .nullable()
        .optional()
        .describe(
          'A value to create or reference a conversation with. If not provided the conversation cannot be referenced in the future.',
        ),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        id: 'agentId',
        label: 'Agent',
        inputType: 'dynamic-select',
        description: 'The agent to message within same project.',
        placeholder: 'Select an agent',
        hideCustomTab: true,
        _getDynamicValues: async ({ projectId, agentId }) => {
          const projectAgents = await this.app.prisma.agent.findMany({
            where: {
              FK_projectId: projectId,
            },
            select: {
              id: true,
              name: true,
            },
          });

          if (agentId) {
            //filter out the agentId from projectAgents so that agent cant message itself
            return projectAgents
              .filter((agent) => agent.id !== agentId)
              .map((agent) => ({
                label: agent.name,
                value: agent.id,
              }));
          } else {
            return projectAgents.map((agent) => ({
              label: agent.name,
              value: agent.id,
            }));
          }
        },
        required: {
          missingMessage: 'Agent is required',
          missingStatus: 'warning',
        },
      },
      {
        id: 'data',
        inputType: 'text',
        label: 'Message',
        description: 'The message (data) to forward to the agent.',
        required: {
          missingMessage: 'Content is required',
          missingStatus: 'warning',
        },
        placeholder: 'Add a message',
      },
      {
        id: 'customIdentifier',
        inputType: 'text',
        label: 'Custom Identifier',
        description:
          'This value will be used to reference this conversation in the future. If you provide a value that already exists for this Agent, then the conversation will be continued.',
        placeholder: 'Add optional identifier',
      },
    ];
  }

  async run({
    configValue,
    projectId,
    workflowId: requestingWorkflowId,
    workspaceId,
    agentId: requestingAgentId,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
    if (!configValue.data) {
      throw new Error(`No data provided to send to agent`);
    }

    //Verify that the agentId belongs to the project
    const agentExistsInProject = await this.app.prisma.agent.findFirst({
      where: {
        AND: [
          {
            id: configValue.agentId,
          },
          {
            FK_projectId: projectId,
          },
        ],
      },
      select: {
        id: true,
      },
    });

    if (!agentExistsInProject) {
      throw new Error(
        `Agent does not exist in this project: ${configValue.agentId}`,
      );
    }

    let taskName = '';
    const taskDescription: string = requestingAgentId
      ? 'Message from agent'
      : 'Run from workflow';

    if (typeof configValue.data === 'string') {
      taskName =
        configValue.data.length > 30
          ? configValue.data.slice(0, 30) + '...'
          : configValue.data;
    } else if (requestingAgentId) {
      taskName = 'Message from agent';
    } else if (requestingWorkflowId) {
      taskName = 'Run from workflow';
    }

    const newTask = await this.app.task.create({
      agentId: configValue.agentId,
      data: {
        name: taskName,
        description: taskDescription,
        customIdentifier: configValue.customIdentifier ?? undefined,
      },
    });

    const messageResult = await this.app.task.messageTask({
      messages: [
        {
          id: v4(),
          role: 'user',
          content: configValue.data,
        },
      ],
      taskId: newTask.id,
      requestingWorkflowId: requestingWorkflowId,
      workspaceId,
      requestingAgentId: requestingAgentId,
      shouldStream: false,
      simpleResponse: true,
    });

    const textResponse = messageResult;

    const taskLink = `${ServerConfig.CLIENT_URL}/projects/${projectId}/agents/${configValue.agentId}/tasks/${newTask.id}`;

    return {
      taskLink: taskLink,
      response: textResponse as string,
    };
  }

  async mockRun(): Promise<Response> {
    return {
      taskLink: `${ServerConfig.CLIENT_URL}/path/to/agent/task`,
      response: 'The response of the agent',
    };
  }
}

type Response = {
  taskLink: string;
  response: string;
};

type ConfigValue = z.infer<ReturnType<MessageAgent['aiSchema']>> & {
  simpleResponse: 'simple' | 'detailed';
  agentId: string;
};

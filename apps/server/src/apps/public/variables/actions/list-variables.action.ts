import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { Variables } from '../variables.app';

export class ListVariables extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Variables;
  id() {
    return 'variables_action_list-variables';
  }
  needsConnection() {
    return false;
  }
  name() {
    return 'List Variables';
  }
  iconUrl(): null | string {
    return `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.app.id}.svg`;
  }
  description() {
    return 'Lists all variables available to the project.';
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
          "Lists all AI agents available to the project. This includes this project's variables and workspace variables.",
      },
    ];
  }

  async run({
    projectId,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
    const variables = await this.app.prisma.variable.findMany({
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
        value: true,
      },
    });

    return {
      variables: variables.map((variable) => ({
        id: variable.id,
        name: variable.name,
        description: variable.description,
        value: variable.value as any,
      })),
    };
  }

  async mockRun(): Promise<Response> {
    return {
      variables: [
        {
          id: '1',
          name: 'Variable 1',
          description: 'This is a variable',
          value: true,
        },
        {
          id: '2',
          name: 'Variable 2',
          description: 'This is another variable',
          value: 'This is a variable value',
        },
      ],
    };
  }
}

type ConfigValue = z.infer<ReturnType<ListVariables['aiSchema']>>;

type Response = {
  variables: {
    id: string;
    name: string;
    description: string;
    value: string | boolean | number;
  }[];
};

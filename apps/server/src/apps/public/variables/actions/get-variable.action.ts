import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { Variables } from '../variables.app';

export class GetVariable extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Variables;
  id() {
    return 'variables_action_get-variables';
  }
  needsConnection() {
    return false;
  }
  name() {
    return 'Get Variable';
  }
  iconUrl(): null | string {
    return `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.app.id}.svg`;
  }
  description() {
    return 'Retrieve a variable by its ID.';
  }
  aiSchema() {
    return z.object({
      variableId: z
        .string()
        .describe('Variable ID. If you do not have the ID, please ask for it.'),
    });
  }
  inputConfig(): InputConfig[] {
    return [this.app.dynamicGetVariable()];
  }

  async run({
    configValue,
    projectId,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
    if (!configValue.variableId) {
      throw new Error('Variable ID is required');
    }

    const variable = await this.app.prisma.variable.findFirst({
      where: {
        AND: [
          { id: configValue.variableId },
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
        name: true,
        description: true,
        value: true,
      },
    });

    if (!variable) {
      throw new Error('Variable not found');
    }

    return {
      variable,
    } as Response;
  }

  async mockRun(): Promise<Response> {
    return {
      variable: {
        id: '1',
        name: 'Variable 1',
        description: 'This is a variable',
        value: 'This can be text, number, boolean, or data',
      },
    };
  }
}

type ConfigValue = z.infer<ReturnType<GetVariable['aiSchema']>>;

type Response = {
  variable: {
    id: string;
    name: string;
    description: string;
    value: string | boolean | number;
  };
};

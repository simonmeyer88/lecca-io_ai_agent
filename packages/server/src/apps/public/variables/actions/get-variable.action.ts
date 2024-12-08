import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { Variables } from '../variables.app';

export class GetVariable extends Action {
  app: Variables;
  id = 'variables_action_get-variables';
  needsConnection = false;
  name = 'Get Variable';
  iconUrl: null | string =
    `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.app.id}.svg`;
  description = 'Retrieve a variable by its ID.';
  aiSchema = z.object({
    variableId: z
      .string()
      .describe('Variable ID. If you do not have the ID, please ask for it.'),
  });
  inputConfig: InputConfig[] = [this.app.dynamicGetVariable()];

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

type ConfigValue = z.infer<GetVariable['aiSchema']>;

type Response = {
  variable: {
    id: string;
    name: string;
    description: string;
    value: string | boolean | number;
  };
};

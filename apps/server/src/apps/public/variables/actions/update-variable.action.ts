import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { parseDateToISO } from '@/apps/utils/parse-date-to-iso';
import { ServerConfig } from '@/config/server.config';

import { Variables } from '../variables.app';

export class UpdateVariable extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Variables;
  id() {
    return 'variables_action_update-variables';
  }
  needsConnection() {
    return false;
  }
  name() {
    return 'Update Variable';
  }
  iconUrl(): null | string {
    return `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.app.id}.svg`;
  }
  description() {
    return "Updates a variable's value";
  }
  aiSchema() {
    return z
      .object({
        variableId: z
          .string()
          .nullable()
          .optional()
          .describe(
            'Variable ID. If you do not have the ID, please ask for it.',
          ),
        value: z
          .any()
          .nullable()
          .optional()
          .describe(
            "New value for the variable. Must be string, number, boolean, or ISO date. If you don't know what type the variable is, please ask.",
          ),
      })
      .nullable()
      .optional();
  }
  inputConfig(): InputConfig[] {
    return [
      this.app.dynamicGetVariable(),
      {
        id: 'value',
        label: 'New Value',
        inputType: 'json',
        description:
          "New value for the variable. Must match the variable's data type.",
        placeholder: 'Add new value',
        required: {
          missingStatus: 'warning',
          missingMessage: 'Please provide a new value',
        },
      },
    ];
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
        dataType: true,
      },
    });

    if (!variable) {
      throw new Error('Variable not found');
    }

    //Validate new value matches dataType
    switch (variable.dataType) {
      case 'boolean':
        if (
          typeof configValue.value !== 'boolean' &&
          configValue.value != 'true' &&
          configValue.value != 'false'
        ) {
          throw new Error('Value must be true or false (boolean)');
        }

        if (configValue.value == 'true') {
          configValue.value = true;
        } else if (configValue.value == 'false') {
          configValue.value = false;
        }
        break;
      case 'number':
        if (typeof configValue.value !== 'number' && isNaN(configValue.value)) {
          throw new Error('Value must be a number');
        }

        configValue.value = Number(configValue.value);
        break;
      case 'string':
        if (typeof configValue.value !== 'string') {
          throw new Error('Value must be a string');
        }
        break;
      case 'date':
        configValue.value = parseDateToISO(configValue.value);
        break;
      case 'json':
        try {
          configValue.value = JSON.parse(configValue.value);
        } catch {
          throw new Error('Value must be a valid JSON');
        }
    }

    const updatedVariable = await this.app.prisma.variable.update({
      where: {
        id: configValue.variableId,
      },
      data: {
        value: configValue.value,
      },
      select: {
        id: true,
        name: true,
        description: true,
        value: true,
      },
    });

    return {
      variable: updatedVariable,
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

type ConfigValue = z.infer<ReturnType<UpdateVariable['aiSchema']>>;

type Response = {
  variable: {
    id: string;
    name: string;
    description: string;
    value: string | boolean | number;
  };
};

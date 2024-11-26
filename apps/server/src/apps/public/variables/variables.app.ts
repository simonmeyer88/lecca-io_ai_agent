import { Action } from '@/apps/lib/action';
import { Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { Trigger } from '@/apps/lib/trigger';
import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { ServerConfig } from '@/config/server.config';

import { GetVariable } from './actions/get-variable.action';
import { ListVariables } from './actions/list-variables.action';
import { UpdateVariable } from './actions/update-variable.action';

export class Variables extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

  id = 'variables';
  name = 'Variables';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description = `Leverage ${ServerConfig.PLATFORM_NAME} variables to reuse data across your workflows.`;
  isPublished = true;

  connections(): Connection[] {
    return [];
  }

  actions(): Action[] {
    return [
      new UpdateVariable({ app: this }),
      new ListVariables({ app: this }),
      new GetVariable({ app: this }),
    ];
  }

  triggers(): Trigger[] {
    return [];
  }

  dynamicGetVariable(): InputConfig {
    return {
      id: 'variableId',
      inputType: 'dynamic-select',
      label: 'Variable ID',
      description:
        'Retrieve a variable by its ID. Only variables available to the project can be retrieved.',
      required: {
        missingStatus: 'warning',
        missingMessage: 'Please provide a variable ID',
      },
      _getDynamicValues: async ({ projectId, workspaceId }) => {
        const variables = await this.prisma.variable.findMany({
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

        return variables.map((variable) => ({
          label: variable.name,
          value: variable.id,
        }));
      },
    };
  }
}

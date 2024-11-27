import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  ActionResponse,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { NodeViewOptions } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';
import { ExecutionNodeForRunner } from '@/modules/core/workflow-runner/workflow-runner.service';

import { FlowControl } from '../flow-control.app';

export class GetCustomInput extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: FlowControl;
  id = 'flow-control_action_get-custom-input';
  needsConnection = false;
  name = 'Get Input Data';
  iconUrl: null | string =
    `${ServerConfig.INTEGRATION_ICON_BASE_URL}/actions/${this.id}.svg`;
  description = 'Wait for a user to provide custom input data to resume.';
  availableForAgent = false;

  viewOptions: NodeViewOptions = {
    showManualInputButton: true,
    manualInputButtonOptions: {
      label: 'Confirm Input',
      tooltip:
        'Once the input is provided, the execution will resume as normal using that input.',
    },
    saveButtonOptions: {
      hideSaveAndTestButton: true,
      replaceSaveButton: {
        label: 'Save Input Configuration',
        type: 'mock',
        tooltip:
          'Saves and updates the input data configuration that will be filled out during the execution.',
      },
    },
  };
  aiSchema = z.object({});
  isInterruptingAction = true;

  handleInterruptingResponse({
    runResponse,
  }: {
    runResponse: unknown;
  }): ActionResponse<unknown> {
    return {
      needsInput: runResponse,
    };
  }

  inputConfig: InputConfig[] = [
    {
      id: 'inputs',
      inputType: 'config-builder',
      description: '',
      label: 'Optional Input Data',
      loadOptions: {
        workflowOnly: true,
      },
    },
    {
      id: 'customInputConfigValues',
      inputType: 'static-input-config',
      label: 'Required Input Data',
      description: 'These are the custom fields configured for this action',
    },
    ...this.app.dynamicInputNeededNotificationConfig(),
    {
      id: 'markdown1',
      label: '',
      description: '',
      inputType: 'markdown',
      markdown:
        'Anyone with access to this workflow can enter the input data. However, the assignee is the one who will be notified.',
    },
  ];

  async run({
    executionId,
    configValue,
    projectId,
    workflowId,
  }: RunActionArgs<ConfigValue>): Promise<unknown> {
    if (!configValue) {
      configValue = {} as ConfigValue;
    }
    //We don't know the custom properties on the configValue, so we will just check for nodeId
    //because nodeId is only passed when the user is manually entering data.
    if (configValue.nodeId) {
      const executionWithNodes = await this.app.prisma.execution.findFirst({
        where: {
          id: executionId,
        },
        select: {
          nodes: true,
          status: true,
        },
      });

      /* eslint-disable @typescript-eslint/no-unused-vars */
      //Only nodeId and the input data will be passed, so we need to ingore nodeId for the output
      const { nodeId, ...inputData } = configValue;

      const updatedNodes = (
        executionWithNodes.nodes as ExecutionNodeForRunner[]
      ).map((node) => {
        if (node.id === configValue.nodeId) {
          return {
            ...node,
            output: {
              ...node.output,
              ...inputData,
            },
            executionStatus: 'SUCCESS',
          };
        }

        return node;
      });

      await this.app.prisma.execution.update({
        where: {
          id: executionId,
        },
        data: {
          nodes: updatedNodes,
          status: 'RUNNING',
        },
        select: {
          id: true,
        },
      });

      //Don't need to return anything. We already updated the execution node with the
      //paths to take. The initiator of this run (webhook.service -> handleExecutionWebhookEvent) will
      //run the execution again if this is true.
      return true;
    } else {
      const { assignee, sendNotification, instructions } = configValue;

      if (sendNotification === 'true' && assignee) {
        await this.app.verifyAssigneeHasAccessToProject({
          projectId,
          workspaceUserId: assignee,
        });

        const workflowWithName = await this.app.prisma.workflow.findFirst({
          where: {
            id: workflowId,
          },
          select: {
            name: true,
          },
        });

        //Send notification async
        this.app.notification.create({
          data: {
            link: `/projects/${projectId}/executions/${executionId}`,
            title: 'Execution Needs Input Data',
            message: `The execution for workflow - ${workflowWithName.name} - has been paused. Please provide the requested input data when you're ready.${instructions ? `\n\nInstructions: ${instructions}` : ''}`,
            workspaceUserId: assignee,
          },
        });
      }

      return {
        assignee: sendNotification === 'true' ? assignee : undefined,
      };
    }
  }

  async mockRun({ configValue }: RunActionArgs<ConfigValue>): Promise<unknown> {
    if (!configValue.customInputConfig) {
      return {};
    }

    const returnInputData: Record<string, any> = {};

    for (const input of Object.values(configValue.customInputConfig ?? {})) {
      returnInputData[input.id] = '';
    }

    return returnInputData;
  }
}

type ConfigValue = z.infer<GetCustomInput['aiSchema']> & {
  sendNotification: 'true' | 'false';
  assignee: string | undefined;
  instructions: string | undefined;

  requiredInputData: Record<string, unknown>;
  nodeId: string;

  customInputConfig: Record<string, any> | undefined;
};

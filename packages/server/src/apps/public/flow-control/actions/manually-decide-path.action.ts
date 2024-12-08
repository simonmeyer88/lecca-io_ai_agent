import { z } from 'zod';

import { Action, ActionResponse, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { NodeViewOptions } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';
import { ExecutionNodeForRunner } from '@/modules/core/workflow-runner/workflow-runner.service';

import { FlowControl } from '../flow-control.app';

export class ManuallyDecidePaths extends Action {
  app: FlowControl;
  id = 'flow-control_action_manually-decide-paths';
  needsConnection = false;
  name = 'Manually Decide Path';
  iconUrl: null | string =
    `${ServerConfig.INTEGRATION_ICON_BASE_URL}/actions/${this.id}.svg`;
  description = 'Wait for a user to manually decide which path to take.';
  availableForAgent = false;
  viewOptions: NodeViewOptions = {
    showManualInputButton: true,
    manualInputButtonOptions: {
      label: 'Confirm Path',
      tooltip:
        'Once confirmed, the path will be selected and the execution will continue.',
    },
    saveButtonOptions: {
      hideSaveAndTestButton: true,
      replaceSaveButton: {
        label: 'Save Path Options',
        type: 'save',
        tooltip:
          'Saves and updates the options that will be available for the user to select.',
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
      id: 'markdown',
      label: '',
      description: '',
      inputType: 'markdown',
      markdown:
        "Make sure to click **Save Path Options** after adding or removing paths. Or else the path updates won't be saved.",
    },
    {
      id: 'decidePathOptions',
      label: 'Configure Paths',
      description:
        'Connect actions to this node to configure your path options.',
      inputType: 'decide-paths',
    },
    ...this.app.dynamicInputNeededNotificationConfig(),
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

    if (configValue.pathDecision) {
      //Decision was made
      //This only runs when the hit the execution/id/node/id endpoint to make a decision
      //1. We will update the node's outputs with the { pathsToTake: [pathId] }
      //2. Then update the node's executionStatus to 'SUCCESS'
      //3. Manually run the execution again to start the execution again, but it will start from the latest "SUCCESS" nodes

      const executionWithNodes = await this.app.prisma.execution.findFirst({
        where: {
          id: executionId,
        },
        select: {
          nodes: true,
        },
      });

      if (!executionWithNodes) {
        //The user might've deleted the execution and then tried to make a decision (because the link still exists in their email, or slack, .etc)
        throw new Error('Execution not found');
      }

      const updatedNodes = (
        executionWithNodes.nodes as ExecutionNodeForRunner[]
      ).map((node) => {
        if (node.id === configValue.nodeId) {
          return {
            ...node,
            output: {
              ...node.output,
              pathsToTake: configValue.pathDecision.pathIds,
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
      if (!configValue.decidePathOptions) {
        throw new Error('No paths to select found');
      }

      //We're going to pause the execution here and wait for the user to manually decide which path to take.
      //The execution runner will know to pause the execution because of this action's isInterruptingAction property.
      const { assignee, sendNotification, instructions } = configValue;

      //TODO: SEND NOTIFICATION
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
            title: `Execution Paused - Decide which path to take`,
            message: `The execution for workflow - ${workflowWithName.name} - has been paused. Please decide which path to take.${instructions ? `\n\nInstructions: ${instructions}` : ''}`,
            workspaceUserId: assignee,
          },
        });
      }

      return {
        pathOptions: configValue.decidePathOptions,
        assignee: sendNotification === 'true' ? assignee : undefined,
      };
    }
  }

  async mockRun(): Promise<unknown> {
    return {};
  }
}

type ConfigValue = z.infer<ManuallyDecidePaths['aiSchema']> & {
  instructions: string | undefined;
  sendNotification: 'true' | 'false';
  assignee: string | undefined;

  //This is present on the first run of the action
  decidePathOptions?: { label: string; pathId: string }[];

  //This is present when the user makes a decision
  pathDecision?: {
    pathIds: string[]; //comma separated list of path ids
  };

  //This is present when the user makes a decision
  nodeId: string;
};

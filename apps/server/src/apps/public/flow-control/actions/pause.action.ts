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

export class Pause extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: FlowControl;
  id() {
    return 'flow-control_action_pause';
  }
  needsConnection() {
    return false;
  }
  name() {
    return 'Pause';
  }
  iconUrl(): null | string {
    return `${ServerConfig.INTEGRATION_ICON_BASE_URL}/actions/${this.id()}.svg`;
  }
  description() {
    return 'Pauses the execution until it is manually continued.';
  }
  availableForAgent(): boolean {
    return false;
  }
  viewOptions(): NodeViewOptions {
    return {
      showManualInputButton: true,
      manualInputButtonOptions: {
        label: 'Resume',
        tooltip: 'Once pressed, the execution will continue as normal.',
      },
      saveButtonOptions: {
        hideSaveAndTestButton: true,
      },
    };
  }
  aiSchema() {
    return z.object({});
  }
  isInterruptingAction() {
    return true;
  }
  handleInterruptingResponse({
    runResponse,
  }: {
    runResponse: unknown;
  }): ActionResponse<unknown> {
    return {
      needsInput: runResponse,
    };
  }
  inputConfig(): InputConfig[] {
    return [
      {
        id: 'resumeExecution',
        inputType: 'resume-execution',
        description: '',
        label: '',
      },
      ...this.app.dynamicInputNeededNotificationConfig(),
      {
        id: 'markdown1',
        label: '',
        description: '',
        inputType: 'markdown',
        markdown:
          'Anyone with access to this workflow can resume the execution. However, the assignee is the one who will be notified.',
      },
    ];
  }

  async run({
    configValue,
    executionId,
    projectId,
    workflowId,
  }: RunActionArgs<ConfigValue>): Promise<unknown> {
    if (!configValue) {
      configValue = {} as ConfigValue;
    }

    if (configValue.resumeExecution) {
      //Manualy Input to Resume was made.
      //1. We will update the node's executionStatus to 'SUCCESS'
      //2. Manually run the execution again to start the execution again, but it will start from the latest "SUCCESS" nodes

      const executionWithNodes = await this.app.prisma.execution.findFirst({
        where: {
          id: executionId,
        },
        select: {
          nodes: true,
          status: true,
        },
      });

      const updatedNodes = (
        executionWithNodes.nodes as ExecutionNodeForRunner[]
      ).map((node) => {
        if (node.id === configValue.nodeId) {
          return {
            ...node,
            output: {
              ...node.output,
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
      //We're going to pause the execution here and wait for the user to continue the run manually.
      //The execution runner will know to pause the execution because of this action's isInterruptingAction property.

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
            title: 'Execution Paused - Needs Input',
            message: `The execution for workflow - ${workflowWithName.name} - has been paused. Please take a look and resume the execution when you're ready.${instructions ? `\n\nInstructions: ${instructions}` : ''}`,
            workspaceUserId: assignee,
          },
        });
      }

      return {
        paused: true,
        assignee: sendNotification === 'true' ? assignee : undefined,
      };
    }
  }

  async mockRun(): Promise<unknown> {
    //Mock is not available for this action anyway, so doesn't matter.
    return {
      paused: true,
    };
  }
}

type ConfigValue = z.infer<ReturnType<Pause['aiSchema']>> & {
  sendNotification: 'true' | 'false';
  assignee: string | undefined;
  instructions: string | undefined;
  //Used when the user manually resumes the execution
  resumeExecution: boolean;
  nodeId: string;
};

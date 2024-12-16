import {
  WorkflowNode,
  createAction,
  createMarkdownField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/flow-control.shared';

export const pause = createAction<any>({
  id: 'flow-control_action_pause',
  name: 'Pause',
  description: 'Pauses the execution until it is manually continued.',
  iconUrl: `${process.env.INTEGRATION_ICON_BASE_URL}/actions/flow-control_action_pause.svg`,
  availableForAgent: false,
  viewOptions: {
    showManualInputButton: true,
    manualInputButtonOptions: {
      label: 'Resume',
      tooltip: 'Once pressed, the execution will continue as normal.',
    },
    saveButtonOptions: {
      hideSaveAndTestButton: true,
    },
  },
  aiSchema: z.object({}),
  handleInterruptingResponse: ({ runResponse }) => ({
    needsInput: runResponse,
  }),
  inputConfig: [
    {
      id: 'resumeExecution',
      inputType: 'resume-execution',
      description: '',
      label: '',
    },
    ...shared.dynamicInputNeededNotificationConfig,
    createMarkdownField({
      id: 'markdown1',
      markdown:
        'Anyone with access to this workflow can resume the execution. However, the assignee is the one who will be notified.',
    }),
  ],
  run: async ({
    configValue,
    executionId,
    projectId,
    workflowId,
    prisma,
    notification,
  }) => {
    if (!configValue) {
      configValue = {} as any;
    }

    if (configValue.resumeExecution) {
      const executionWithNodes = await prisma.execution.findFirst({
        where: {
          id: executionId,
        },
        select: {
          nodes: true,
          status: true,
        },
      });

      const updatedNodes = (executionWithNodes.nodes as WorkflowNode[]).map(
        (node) => {
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
        },
      );

      await prisma.execution.update({
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

      return true;
    } else {
      const { assignee, sendNotification, instructions } = configValue;

      if (sendNotification === 'true' && assignee) {
        await shared.verifyAssigneeHasAccessToProject({
          projectId,
          workspaceUserId: assignee,
          prisma,
        });

        const workflowWithName = await prisma.workflow.findFirst({
          where: {
            id: workflowId,
          },
          select: {
            name: true,
          },
        });

        notification.create({
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
  },
  mockRun: async () => ({
    paused: true,
  }),
});

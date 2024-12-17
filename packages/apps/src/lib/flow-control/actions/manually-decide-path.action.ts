import {
  WorkflowNode,
  createAction,
  createMarkdownField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/flow-control.shared';

export const manuallyDecidePaths = createAction({
  id: 'flow-control_action_manually-decide-paths',
  name: 'Manually Decide Path',
  description: 'Wait for a user to manually decide which path to take.',
  iconUrl: `https://lecca-io.s3.us-east-2.amazonaws.com/assets/actions/flow-control_action_manually-decide-paths.svg`,
  availableForAgent: false,
  viewOptions: {
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
  },
  aiSchema: z.object({
    instructions: z.string().optional(),
    sendNotification: z.enum(['true', 'false']),
    assignee: z.string().optional(),
    decidePathOptions: z
      .array(
        z.object({
          label: z.string(),
          pathId: z.string(),
        }),
      )
      .optional(),
    pathDecision: z
      .object({
        pathIds: z.array(z.string()),
      })
      .optional(),
    nodeId: z.string().optional(),
  }),
  inputConfig: [
    createMarkdownField({
      id: 'markdown',
      markdown:
        "Make sure to click **Save Path Options** after adding or removing paths. Or else the path updates won't be saved.",
    }),
    {
      id: 'decidePathOptions',
      label: 'Configure Paths',
      description:
        'Connect actions to this node to configure your path options.',
      inputType: 'decide-paths',
    },
  ],
  run: async ({
    executionId,
    configValue,
    projectId,
    workflowId,
    prisma,
    notification,
  }) => {
    if (configValue.pathDecision) {
      const executionWithNodes = await prisma.execution.findFirst({
        where: {
          id: executionId,
        },
        select: {
          nodes: true,
        },
      });

      if (!executionWithNodes) {
        throw new Error('Execution not found');
      }

      const updatedNodes = (executionWithNodes.nodes as WorkflowNode[]).map(
        (node) => {
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
      if (!configValue.decidePathOptions) {
        throw new Error('No paths to select found');
      }

      const { assignee, sendNotification, instructions } = configValue;

      if (sendNotification === 'true' && assignee) {
        const workflowWithName = await prisma.workflow.findFirst({
          where: {
            id: workflowId,
          },
          select: {
            name: true,
          },
        });

        // Note: Assuming shared.verifyAssigneeHasAccessToProject and shared.notification are available
        await shared.verifyAssigneeHasAccessToProject({
          projectId,
          workspaceUserId: assignee,
          prisma,
        });

        notification.create({
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
  },
  mockRun: async () => ({}),
  handleInterruptingResponse({ runResponse }) {
    return {
      needsInput: runResponse,
    };
  },
});

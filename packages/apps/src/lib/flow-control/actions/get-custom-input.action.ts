import { WorkflowNode, createAction } from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/flow-control.shared';

export const getCustomInput = createAction({
  id: 'flow-control_action_get-custom-input',
  name: 'Get Input Data',
  description: 'Wait for a user to provide custom input data to resume.',
  iconUrl: `https://lecca-io.s3.us-east-2.amazonaws.com/assets/actions/flow-control_action_get-custom-input.svg`,
  availableForAgent: false,
  viewOptions: {
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
  },
  aiSchema: z.object({
    sendNotification: z.enum(['true', 'false']),
    assignee: z.string().optional(),
    instructions: z.string().optional(),
    requiredInputData: z.record(z.unknown()),
    nodeId: z.string(),
    customInputConfig: z.record(z.any()).optional(),
  }),
  inputConfig: [
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
    {
      id: 'markdown1',
      label: '',
      description: '',
      inputType: 'markdown',
      markdown:
        'Anyone with access to this workflow can enter the input data. However, the assignee is the one who will be notified.',
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
    if (!configValue) {
      configValue = {} as any;
    }

    if (configValue.nodeId) {
      const executionWithNodes = await prisma.execution.findFirst({
        where: { id: executionId },
        select: { nodes: true, status: true },
      });

      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { nodeId, ...inputData } = configValue;

      const updatedNodes = (executionWithNodes.nodes as WorkflowNode[]).map(
        (node) => {
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
        },
      );

      await prisma.execution.update({
        where: { id: executionId },
        data: {
          nodes: updatedNodes,
          status: 'RUNNING',
        },
        select: { id: true },
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
          where: { id: workflowId },
          select: { name: true },
        });

        notification.create({
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
  },
  mockRun: async ({ configValue }) => {
    if (!configValue.customInputConfig) {
      return {};
    }

    const returnInputData: Record<string, any> = {};

    for (const input of Object.values(configValue.customInputConfig ?? {})) {
      returnInputData[(input as any).id] = '';
    }

    return returnInputData;
  },
  handleInterruptingResponse: ({ runResponse }) => {
    return {
      needsInput: runResponse,
    };
  },
});

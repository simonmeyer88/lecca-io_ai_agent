import { createAction, createDynamicSelectInputField } from '@lecca-io/toolkit';
import { z } from 'zod';

export const runWorkflow = createAction({
  id: 'flow-control_action_run-workflow',
  name: 'Run Workflow',
  description: 'Trigger one of your workflows.',
  iconUrl: `${process.env.INTEGRATION_ICON_BASE_URL}/actions/flow-control_action_run-workflow.svg`,
  needsConnection: false,
  viewOptions: {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save',
        type: 'mock',
      },
      hideSaveButton: true,
    },
  },
  inputConfig: [
    createDynamicSelectInputField({
      id: 'workflowId',
      label: 'Workflow',
      description:
        'Only manual and scheduled workflows can be triggered by a workflow.',
      placeholder: 'Select a workflow',
      hideCustomTab: true,
      _getDynamicValues: async ({ projectId, workflowId, prisma }) => {
        const projectWorkflows = await prisma.workflow.findMany({
          where: {
            AND: [
              {
                id: { not: workflowId },
              },
              {
                FK_projectId: projectId,
              },
              {
                strategy: { in: ['manual', 'schedule'] },
              },
            ],
          },
          select: {
            id: true,
            name: true,
          },
        });

        return projectWorkflows.map((workflow) => ({
          label: workflow.name,
          value: workflow.id,
        }));
      },
      required: {
        missingMessage: 'Workflow is required',
        missingStatus: 'warning',
      },
    }),
    {
      id: 'customInputConfigValues',
      inputType: 'dynamic-input-config',
      label: 'Workflow Input Data',
      description:
        'These are the custom fields configured in the workflow "Manually Run" trigger.',
      loadOptions: {
        dependsOn: ['workflowId'],
        workflowOnly: true,
        forceRefresh: true,
      },
      _getDynamicValues: async ({ projectId, extraOptions, prisma }) => {
        const { workflowId } = extraOptions as { workflowId: string };

        if (!workflowId) {
          throw new Error('Workflow ID is required');
        }

        const workflow = await prisma.workflow.findFirst({
          where: {
            AND: [
              { id: workflowId },
              {
                FK_projectId: projectId,
              },
            ],
          },
          select: {
            triggerNode: true,
          },
        });

        if (!workflow) {
          throw new Error('Workflow not found');
        }

        const triggerNode = workflow.triggerNode as any;

        return (
          triggerNode.value?.customInputConfig?.map((input: any) => {
            const formattedInput = { ...input };
            formattedInput.label = input.id;
            return formattedInput;
          }) ?? []
        );
      },
    },
  ],
  aiSchema: z.object({
    workflowId: z.string(),
    customInputConfigValues: z.record(z.union([z.string(), z.number()])),
  }),
  run: async ({
    configValue,
    workflowId: requestingWorkflowId,
    projectId,
    agentId,
    prisma,
    execution,
  }) => {
    if (requestingWorkflowId === configValue.workflowId) {
      throw new Error(`Workflow cannot run itself`);
    }

    const workflowExistsInProject = await prisma.workflow.findFirst({
      where: {
        AND: [
          {
            id: configValue.workflowId,
          },
          {
            FK_projectId: projectId,
          },
        ],
      },
    });

    if (!workflowExistsInProject) {
      throw new Error(
        `Workflow does not exist in this project: ${configValue.workflowId}`,
      );
    }

    const newExecution = await execution.manuallyExecuteWorkflow({
      workflowId: configValue.workflowId,
      skipQueue: true,
      inputData: configValue.customInputConfigValues,
    });

    if (!newExecution) {
      throw new Error(
        `Could not execute workflow for unknown reasons: ${configValue.workflowId}`,
      );
    }

    const executionWithProject = await prisma.execution.findUnique({
      where: {
        id: newExecution.id,
      },
      select: {
        workflow: {
          select: {
            FK_projectId: true,
          },
        },
      },
    });

    const maxPolls = 30;
    const pollIntervalInSeconds = 2;
    let polls = 0;

    const executionLink = `${process.env.CLIENT_URL}/projects/${executionWithProject.workflow.FK_projectId}/executions/${newExecution.id}`;

    while (polls < maxPolls) {
      const execution = await prisma.execution.findUnique({
        where: {
          id: newExecution.id,
        },
        select: {
          status: true,
          statusMessage: true,
          output: true,
        },
      });

      if (execution.status === 'FAILED') {
        throw new Error(
          `${execution.statusMessage}.${agentId ? ` For more details visit: ${executionLink}` : ''}`,
        );
      } else if (execution.status === 'SUCCESS') {
        return {
          executionLink,
          statusMessage: execution.statusMessage,
          data: execution.output ?? null,
          note: !execution.output
            ? `If want your workflow to return data, make sure to add the "Output Workflow Data" action to your workflow.`
            : undefined,
        };
      } else if (execution.status === 'RUNNING') {
        await new Promise((resolve) =>
          setTimeout(resolve, pollIntervalInSeconds * 1000),
        );
        polls++;
      } else if (execution.status === 'NEEDS_INPUT') {
        throw new Error(
          `Workflows that need input cannot be triggered ${agentId ? 'by an agent' : requestingWorkflowId ? 'by another workflow' : ''}.${agentId ? ` For more details visit: ${executionLink}` : ''}`,
        );
      } else if (execution.status === 'SCHEDULED') {
        throw new Error(
          `Workflows that wait or are scheduled cannot be triggered ${agentId ? 'by an agent' : requestingWorkflowId ? 'by another workflow' : ''}.${agentId ? ` For more details visit: ${executionLink}` : ''}`,
        );
      } else {
        throw new Error(`Execution status unknown: ${execution.status}`);
      }
    }

    throw new Error(
      `Workflow execution time out after ${maxPolls * pollIntervalInSeconds} seconds.${agentId ? `For more details visit: ${executionLink}` : ''}`,
    );
  },
  mockRun: async ({ configValue, prisma }) => {
    const workflowWithOutputData = await prisma.workflow.findUnique({
      where: { id: configValue.workflowId },
      select: { output: true },
    });

    return {
      executionLink: undefined,
      statusMessage: undefined,
      note: workflowWithOutputData.output
        ? undefined
        : 'If you want your workflow to return data, make sure to add the "Output Workflow Data" action to your workflow.',
      data: workflowWithOutputData.output ?? null,
    };
  },
});

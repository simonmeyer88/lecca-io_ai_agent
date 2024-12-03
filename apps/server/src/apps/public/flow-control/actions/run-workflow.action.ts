import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { FieldConfig, InputConfig } from '@/apps/lib/input-config';
import { NodeViewOptions } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';
import { WorkflowNodeForRunner } from '@/modules/core/workflow-runner/workflow-runner.service';

import { FlowControl } from '../flow-control.app';

export class RunWorkflow extends Action {
  app: FlowControl;
  needsConnection = false;
  id = `flow-control_action_run-workflow`;
  name = 'Run Workflow';
  iconUrl: null | string =
    `${ServerConfig.INTEGRATION_ICON_BASE_URL}/actions/${this.id}.svg`;
  description = 'Trigger one of your workflows.';
  viewOptions: null | NodeViewOptions = {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save',
        type: 'mock',
      },
      hideSaveButton: true,
      //The behavior is weird if the workflow has to wait or needs input. It just ends up sitting there and timing out. So we'll just not let them run it as a test.
      //If they want to really test it, they'll just need to go to that workflow and test it.
      // replaceSaveButton:
      // {
      //   label: 'Run',
      //   type: 'real',
      // },
    },
  };
  aiSchema = z.object({});
  inputConfig: InputConfig[] = [
    {
      id: 'workflowId',
      label: 'Workflow',
      inputType: 'dynamic-select',
      description:
        'Only manual and scheduled workflows can be triggered by a workflow.',
      placeholder: 'Select a workflow',
      hideCustomTab: true,
      _getDynamicValues: async ({ projectId, workflowId }) => {
        const projectWorkflows = await this.app.prisma.workflow.findMany({
          where: {
            AND: [
              {
                id: { not: workflowId },
              },
              {
                FK_projectId: projectId,
              },
              {
                strategy: { in: ['manual', 'schedule'] }, //These are the only workflows that can be triggered manually at the moment
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
    },
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
      _getDynamicValues: async ({ projectId, extraOptions }) => {
        const { workflowId } = extraOptions as { workflowId: string };

        if (!workflowId) {
          throw new Error('Workflow ID is required');
        }

        const workflow = await this.app.prisma.workflow.findFirst({
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

        const triggerNode = workflow.triggerNode as WorkflowNodeForRunner;

        return (
          triggerNode.value?.customInputConfig?.map((input: FieldConfig) => {
            const formattedInput = { ...input };
            formattedInput.label = input.id;
            return formattedInput;
          }) ?? []
        ); //This should be a InputConfig
      },
    },
  ];

  async run({
    configValue,
    workflowId: requestingWorkflowId,
    projectId,
    agentId,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
    if (requestingWorkflowId === configValue.workflowId) {
      throw new Error(`Workflow cannot run itself`);
    }

    //Verify that the workflowId belongs to the project
    const workflowExistsInProject = await this.app.prisma.workflow.findFirst({
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

    const newExecution = await this.app.execution.manuallyExecuteWorkflow({
      workflowId: configValue.workflowId,
      skipQueue: true,
      inputData: configValue.customInputConfigValues,
    });

    if (!newExecution) {
      throw new Error(
        `Could not execute workflow for unknown reasons: ${configValue.workflowId}`,
      );
    }

    const executionWithProject = await this.app.prisma.execution.findUnique({
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

    //We're going to poll every 2 seconds until the execution is complete.
    //We will poll for a maximum of 30 seconds.
    //In the future we can add a new property to the action to allow the user to set the maximum time to wait for or something.

    const maxPolls = 30;
    const pollIntervalInSeconds = 2;
    let polls = 0;

    const executionLink = `${ServerConfig.CLIENT_URL}/projects/${executionWithProject.workflow.FK_projectId}/executions/${newExecution.id}`;

    while (polls < maxPolls) {
      const execution = await this.app.prisma.execution.findUnique({
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
        //We will throw error so entire execution fails?
        throw new Error(
          `${execution.statusMessage}.${agentId ? ` For more details visit: ${executionLink}` : ''}`,
        );
      } else if (execution.status === 'SUCCESS') {
        return {
          executionLink,
          statusMessage: execution.statusMessage,
          data: (execution.output as any) ?? null,
          note: !execution.output
            ? `If want your workflow to return data, make sure to add the "Output Workflow Data" action to your workflow.`
            : undefined,
        };
      } else if (execution.status === 'RUNNING') {
        //Wait 2 seconds before polling again
        await new Promise((resolve) =>
          setTimeout(resolve, pollIntervalInSeconds * 1000),
        );
        polls++;
      } else if (execution.status === 'NEEDS_INPUT') {
        //We will throw error so entire execution fails?
        throw new Error(
          `Workflows that need input cannot be triggered ${agentId ? 'by an agent' : requestingWorkflowId ? 'by another workflow' : ''}.${agentId ? ` For more details visit: ${executionLink}` : ''}`,
        );
      } else if (execution.status === 'SCHEDULED') {
        //We will throw error so entire execution fails?
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
  }

  async mockRun(args: RunActionArgs<ConfigValue>): Promise<Response> {
    //This will just return the output data from the workflow
    //so that the UI can map the selected workflow's output to it's nodes
    const workflowId = args.configValue.workflowId;

    const workflowWithOutputData = await this.app.prisma.workflow.findUnique({
      where: { id: workflowId },
      select: { output: true },
    });

    return {
      executionLink: undefined,
      statusMessage: undefined,
      note: workflowWithOutputData.output
        ? undefined
        : 'If you want your workflow to return data, make sure to add the "Output Workflow Data" action to your workflow.',
      data: (workflowWithOutputData.output as any) ?? null,
    };
  }
}

type Response = {
  executionLink: string | undefined;
  statusMessage: string | undefined;
  data: Record<string, unknown> | null;
  note?: string;
};

type ConfigValue = z.infer<RunWorkflow['aiSchema']> & {
  workflowId: string;
  customInputConfigValues: Record<string, string | number>;
};

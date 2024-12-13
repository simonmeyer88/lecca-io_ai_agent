import {
  createAction,
  createJsonInputField,
  createMarkdownField,
  jsonParse,
} from '@lecca-io/toolkit';
import { z } from 'zod';

export const outputWorkflowData = createAction({
  id: 'flow-control_action_output-workflow-data',
  name: 'Output Workflow Data',
  description: 'Outputs data that can be used by an agent or another workflow.',
  iconUrl: `${process.env.INTEGRATION_ICON_BASE_URL}/actions/flow-control_action_output-workflow-data.svg`,
  needsConnection: false,
  availableForAgent: false,
  viewOptions: {
    saveButtonOptions: {
      hideSaveButton: true,
      replaceSaveAndTestButton: {
        label: 'Save & Generate Output',
        type: 'mock',
        tooltip:
          'Saves the output data to this workflow. This will allow other workflows using the "Run Workflow" action to map this output data within their workflow.',
      },
    },
  },
  inputConfig: [
    createMarkdownField({
      id: 'markdown1',
      markdown:
        '**Only use this action once per workflow**. When this action runs, it will save the output to the execution. That saved output will be used by other workflows when they use the **Run Workflow** action with this workflow.',
    }),
    createJsonInputField({
      id: 'output',
      label: 'Ouput Data',
      description:
        'This data will be available to other workflows or agents that run this workflow as an aciton.',
      placeholder: 'Enter output data',
    }),
  ],
  aiSchema: z.object({
    output: z.any(),
  }),
  run: async ({ configValue, workflowId, executionId, prisma }) => {
    if (!workflowId) {
      throw new Error('Only a workflow can run this action.');
    }

    const jsonOutput = jsonParse(configValue.output, {
      returnWithoutParsingIfError: true,
    });

    await prisma.execution.update({
      where: { id: executionId },
      data: {
        output: jsonOutput,
      },
    });

    return jsonOutput;
  },
  mockRun: async ({ configValue, workflowId, prisma }) => {
    if (!workflowId) {
      throw new Error('Only a workflow can run this action.');
    }

    const jsonOutput = jsonParse(configValue.output, {
      returnWithoutParsingIfError: true,
    });

    await prisma.workflow.update({
      where: { id: workflowId },
      data: {
        output: jsonOutput,
      },
    });

    return jsonOutput;
  },
});

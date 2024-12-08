import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { NodeViewOptions } from '@/apps/lib/trigger';
import { jsonParse } from '@/apps/utils/json-parse';
import { ServerConfig } from '@/config/server.config';

import { FlowControl } from '../flow-control.app';

export class OutputWorkflowData extends Action {
  app: FlowControl;
  id = 'flow-control_action_output-workflow-data';
  needsConnection = false;
  name = 'Output Workflow Data';
  iconUrl: null | string =
    `${ServerConfig.INTEGRATION_ICON_BASE_URL}/actions/${this.id}.svg`;
  description =
    'Outputs data that can be used by an agent or another workflow.';
  availableForAgent = false;
  aiSchema = z.object({});
  viewOptions: NodeViewOptions = {
    saveButtonOptions: {
      hideSaveButton: true,
      replaceSaveAndTestButton: {
        label: 'Save & Generate Output',
        //Real, but since it's not in an execution it will only save output to workflow
        //I would make it mock, but then I'd have to duplicate a lot of the code. and not having an execution works fine to check if it's mocking.
        type: 'mock',
        tooltip:
          'Saves the output data to this workflow. This will allow other workflows using the "Run Workflow" action to map this output data within their workflow.',
      },
    },
  };
  inputConfig: InputConfig[] = [
    {
      id: 'markdown1',
      markdown:
        '**Only use this action once per workflow**. When this action runs, it will save the output to the execution. That saved output will be used by other workflows when they use the **Run Workflow** action with this workflow.',
      label: '',
      inputType: 'markdown',
      description: '',
    },
    {
      id: 'output',
      inputType: 'json',
      description:
        'This data will be available to other workflows or agents that run this workflow as an aciton.',
      label: 'Ouput Data',
      placeholder: 'Enter output data',
    },
  ];

  async run(args: RunActionArgs<ConfigValue>): Promise<Response> {
    const workflowId = args.workflowId;

    if (!workflowId) {
      throw new Error('Only a workflow can run this action.');
    }

    const jsonOutput = jsonParse(args.configValue.output, {
      returnWithoutParsingIfError: true,
    });

    //This is when this action runs in an actual workflow execution
    //this output can then be referenced by other workflows and agents
    await this.app.prisma.execution.update({
      where: { id: args.executionId },
      data: {
        output: jsonOutput,
      },
    });

    return jsonOutput;
  }

  async mockRun(args: RunActionArgs<ConfigValue>): Promise<Response> {
    const workflowId = args.workflowId;

    if (!workflowId) {
      throw new Error('Only a workflow can run this action.');
    }

    const jsonOutput = jsonParse(args.configValue.output, {
      returnWithoutParsingIfError: true,
    });

    //This is when the user runs Save & Test in their workflow builder
    //We want to update the output so we can use it to map outputs
    await this.app.prisma.workflow.update({
      where: { id: workflowId },
      data: {
        output: jsonOutput,
      },
    });

    return jsonOutput;
  }
}

type ConfigValue = z.infer<OutputWorkflowData['aiSchema']> & {
  output: { key: string; value: string }[];
};

type Response = Record<string, unknown>;

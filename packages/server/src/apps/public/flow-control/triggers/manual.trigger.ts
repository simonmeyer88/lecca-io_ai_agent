import { z } from 'zod';

import { RunActionArgs } from '@/apps/lib/action';
import { FieldConfig, InputConfig } from '@/apps/lib/input-config';
import {
  NodeViewOptions,
  RunTriggerArgs,
  Trigger,
  TriggerStrategy,
} from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';
import { WorkflowNodeForRunner } from '@/modules/core/workflow-runner/workflow-runner.service';

import { FlowControl } from '../flow-control.app';

export class ManualTrigger extends Trigger {
  app: FlowControl;
  id = 'flow-control_trigger_manual';
  needsConnection = false;
  availableForAgent = false;
  name = 'Manually Run';
  iconUrl: null | string =
    `${ServerConfig.INTEGRATION_ICON_BASE_URL}/triggers/${this.id}.svg`;
  strategy: TriggerStrategy = 'manual';
  description =
    'Manually run this workflow as a user, within another workflow, or when requested by an agent.';
  viewOptions: NodeViewOptions = {
    hideConditions: true,
    saveButtonOptions: {
      hideSaveButton: true,
      replaceSaveAndTestButton: {
        label: 'Save',
        type: 'mock',
      },
    },
  };
  aiSchema = z.object({});
  inputConfig: InputConfig[] = [
    {
      id: 'markdown1',
      markdown:
        'Run this workflow as a user, within another workflow, or when requested by an agent.',
      label: '',
      inputType: 'markdown',
      description: '',
    },
    {
      id: 'inputs',
      inputType: 'config-builder',
      description: '',
      label: 'Optional Input Data',
    },
  ];

  async run({
    projectId,
    inputData,

    /**
     * This is the workflowId to run.
     * Let me explain why it's not in configValue.workflowId.
     *
     * If an agent manually runs a workflow, they're not running this trigger. They are running the "Run Workflow" action,
     * which then manually executes the workflow. And since we do it using events and listeners, it would be a bit messy
     * passing the requestingAgentId all the way through through the events and workflow runner. So instead, we just use this workflowId
     * that will always be present whether a workflow calls "Run Workflow" or if an agent does.
     */
    workflowId,
  }: RunTriggerArgs<Record<string, any>>) {
    if (!workflowId) {
      throw new Error('Workflow ID is required');
    }

    const workflowWithManuallyRunInputConfig =
      await this.app.prisma.workflow.findFirst({
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

    if (!workflowWithManuallyRunInputConfig) {
      throw new Error('Workflow not found');
    }

    const triggerNode =
      workflowWithManuallyRunInputConfig.triggerNode as WorkflowNodeForRunner;

    const customInputConfig = triggerNode.value
      ?.customInputConfig as FieldConfig[]; //Not InputConfig, since it doesn't support nested fields

    if (!customInputConfig?.length) {
      return ['No input data requested'];
    } else if (!inputData) {
      throw new Error('No input data provided');
    } else if (typeof inputData !== 'object') {
      throw new Error('Input data must be an object');
    }

    const inputObjectFromData = inputData as Record<string, any>;
    const returnInputData: Record<string, any> = {};

    for (const input of customInputConfig) {
      if (
        inputObjectFromData[input.id] != null &&
        //This is because if a user backspaces (clears) an input, it will be an empty string
        inputObjectFromData[input.id] !== ''
      ) {
        let formattedValue = inputObjectFromData[input.id];

        if (input.inputType === 'number') {
          formattedValue = Number(formattedValue);
        }

        returnInputData[input.id] = formattedValue;
      } else if (
        input.defaultValue != null &&
        //This is because if a user backspaces (clears) an input, it will be an empty string
        input.defaultValue !== ''
      ) {
        let formattedValue = input.defaultValue;

        if (input.inputType === 'number') {
          formattedValue = Number(formattedValue);
        }

        returnInputData[input.id] = formattedValue;
      } else if (input.required) {
        throw new Error(`Required input ${input.id} not provided`);
      } else {
        //need this so that the property exists on the object, even if it's null
        returnInputData[input.id] = null;
      }
    }

    return [returnInputData];
  }

  async mockRun({ configValue }: RunActionArgs<Record<string, any>>) {
    //This is a unique one since it returns the input values to be used throughout the workflow
    if (!configValue?.customInputConfig) {
      return ['No input data provided'];
    }

    const inputObject: Record<string, string | number> = {};

    for (const input of configValue.customInputConfig) {
      if (input.defaultValue != null) {
        const formattedValue = input.defaultValue;

        inputObject[input.id] = formattedValue;
      }
    }

    return [inputObject];
  }
}

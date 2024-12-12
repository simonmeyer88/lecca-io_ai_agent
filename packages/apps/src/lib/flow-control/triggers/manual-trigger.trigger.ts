import {
  FieldConfig,
  WorkflowNode,
  createManualTrigger,
} from '@lecca-io/toolkit';

export const manualTrigger = createManualTrigger<ConfigValue, Response>({
  id: 'flow-control_trigger_manual',
  name: 'Manually Run',
  description:
    'Manually run this workflow as a user, within another workflow, or when requested by an agent.',
  needsConnection: false,
  availableForAgent: false,
  iconUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/triggers/flow-control_trigger_manual.svg',
  inputConfig: [
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
  ],
  run: async ({ projectId, inputData, workflowId, prisma }) => {
    if (!workflowId) {
      throw new Error('Workflow ID is required');
    }

    const workflowWithManuallyRunInputConfig = await prisma.workflow.findFirst({
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
      workflowWithManuallyRunInputConfig.triggerNode as WorkflowNode;

    const customInputConfig = triggerNode.value
      ?.customInputConfig as FieldConfig[]; //Not InputConfig, since it doesn't support nested fields

    if (!customInputConfig?.length) {
      return ['No input data requested'] as any;
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
  },
  mockRun: async ({ configValue }) => {
    //This is a unique one since it returns the input values to be used throughout the workflow
    if (!configValue?.customInputConfig) {
      return ['No input data provided'] as any;
    }

    const inputObject: Record<string, string | number> = {};

    for (const input of configValue.customInputConfig) {
      if (input.defaultValue != null) {
        const formattedValue = input.defaultValue;

        inputObject[input.id] = formattedValue;
      }
    }

    return [inputObject];
  },
});

type ConfigValue = {
  customInputConfig: {
    id: string | number;
    defaultValue: string | number | null;
  }[];
};
type Response = Record<string, any>;

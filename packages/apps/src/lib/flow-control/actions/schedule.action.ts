import {
  WorkflowNode,
  createAction,
  createDateTimeInputField,
  createNumberInputField,
  createSelectInputField,
  parseDateToISO,
} from '@lecca-io/toolkit';
import { DateTime } from 'luxon';
import { z } from 'zod';

export const schedule = createAction({
  id: 'flow-control_action_schedule',
  name: 'Schedule',
  description: 'Pauses the execution and resumes at the scheduled time.',
  iconUrl: `https://lecca-io.s3.us-east-2.amazonaws.com/assets/actions/flow-control_action_schedule.svg`,
  availableForAgent: false,
  viewOptions: {
    showManualInputButton: true,
    manualInputButtonOptions: {
      label: 'Manually Resume',
      tooltip:
        'Instead of waiting for the schedule to resume, you can manually resume the execution.',
    },
    saveButtonOptions: {
      hideSaveAndTestButton: true,
    },
  },
  handleInterruptingResponse: ({ runResponse }: any) => {
    if (runResponse?.immediatelyRun) {
      return {
        success: runResponse,
      };
    } else {
      return {
        scheduled: runResponse,
      };
    }
  },
  inputConfig: [
    {
      id: 'resumeExecution',
      inputType: 'resume-execution',
      description: '',
      label: '',
    },
    createDateTimeInputField({
      id: 'referenceDate',
      label: 'Reference Date',
      description:
        'The date that will be used to calculate when to resume the execution.',
      required: {
        missingMessage: 'Reference Date is required',
        missingStatus: 'warning',
      },
    }),
    createSelectInputField({
      id: 'offsetType',
      label: 'Offset?',
      description:
        'If there is an offset, should it be before or after the reference date?',
      hideCustomTab: true,
      selectOptions: [
        { label: 'No offset', value: 'no-offset' },
        { label: 'Before', value: 'before' },
        { label: 'After', value: 'after' },
      ],
      defaultValue: 'no-offset',
      required: {
        missingMessage: 'Offset is required',
        missingStatus: 'warning',
      },
    }),
    createSelectInputField({
      id: 'offsetUnit',
      label: 'Offset Unit',
      description: 'The unit of time to offset the reference date.',
      defaultValue: 'days',
      hideCustomTab: true,
      selectOptions: [
        { label: 'Minutes', value: 'minutes' },
        { label: 'Hours', value: 'hours' },
        { label: 'Days', value: 'days' },
        { label: 'Weeks', value: 'weeks' },
        { label: 'Months', value: 'months' },
      ],
      loadOptions: {
        dependsOn: [{ id: 'offsetType', value: 'before' }],
      },
    }),
    createSelectInputField({
      id: 'offsetUnit',
      label: 'Offset Unit',
      description: 'The unit of time to offset the reference date.',
      defaultValue: 'days',
      hideCustomTab: true,
      selectOptions: [
        { label: 'Minutes', value: 'minutes' },
        { label: 'Hours', value: 'hours' },
        { label: 'Days', value: 'days' },
        { label: 'Weeks', value: 'weeks' },
        { label: 'Months', value: 'months' },
      ],
      loadOptions: {
        dependsOn: [{ id: 'offsetType', value: 'after' }],
      },
    }),
    createNumberInputField({
      id: 'offsetAmount',
      label: 'Offset Amount',
      description: 'The amount of time to offset the reference date.',
      hideCustomTab: true,
      defaultValue: 1,
      numberOptions: {
        min: 1,
        step: 1,
      },
      loadOptions: {
        dependsOn: [{ id: 'offsetType', value: 'before' }],
      },
    }),
    createNumberInputField({
      id: 'offsetAmount',
      label: 'Offset Amount',
      description: 'The amount of time to offset the reference date.',
      hideCustomTab: true,
      defaultValue: 1,
      numberOptions: {
        min: 1,
        step: 1,
      },
      loadOptions: {
        dependsOn: [{ id: 'offsetType', value: 'after' }],
      },
    }),
    createSelectInputField({
      id: 'howToHandlePastDates',
      label: 'How to handle past dates?',
      hideCustomTab: true,
      selectOptions: [
        { label: 'Always continue', value: 'always-continue' },
        {
          label: `Continue if it's up to 15 minutes`,
          value: 'continue-if-15-minutes',
        },
        { label: `Continue if it's up to 1 hour`, value: 'continue-if-1-hour' },
        { label: `Continue if it's up to 1 day`, value: 'continue-if-1-day' },
        { label: `Continue if it's up to 1 week`, value: 'continue-if-1-week' },
        {
          label: `Continue if it's up to 1 month`,
          value: 'continue-if-1-month',
        },
      ],
      description:
        'If the calculated date is in the past, how should we handle it? This includes a future reference date with offsets making the calculated date in the past.',
      defaultValue: 'always-continue',
      required: {
        missingMessage: 'How to handle past dates is required',
        missingStatus: 'warning',
      },
    }),
  ],
  aiSchema: z.object({
    referenceDate: z.string(),
    offsetType: z.enum(['no-offset', 'before', 'after']),
    offsetAmount: z.number(),
    offsetUnit: z.enum(['minutes', 'hours', 'days', 'weeks', 'months']),
    howToHandlePastDates: z.enum([
      'always-continue',
      'continue-if-15-minutes',
      'continue-if-1-hour',
      'continue-if-1-day',
      'continue-if-1-week',
      'continue-if-1-month',
    ]),
    resumeExecution: z.boolean().optional(),
    nodeId: z.string().optional(),
  }),
  run: async ({ configValue, executionId, prisma }) => {
    if (!configValue) {
      configValue = {} as z.infer<typeof schedule.aiSchema>;
    }

    if (configValue.resumeExecution) {
      const executionWithNodes = await prisma.execution.findFirst({
        where: { id: executionId },
        select: { nodes: true },
      });

      const updatedNodes = (executionWithNodes.nodes as WorkflowNode[]).map(
        (node) => {
          if (node.id === configValue.nodeId) {
            return {
              ...node,
              output: { ...node.output },
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
          continueExecutionAt: null,
          status: 'RUNNING',
        },
        select: { id: true },
      });

      return true as any;
    }

    const {
      referenceDate,
      offsetType,
      offsetAmount,
      offsetUnit,
      howToHandlePastDates,
    } = configValue;

    const isoDate = parseDateToISO(referenceDate);
    let scheduledAt = DateTime.fromISO(isoDate);

    try {
      if (offsetType !== 'no-offset') {
        const multiplier = offsetType === 'before' ? -1 : 1;
        scheduledAt = scheduledAt.plus({
          [offsetUnit]: multiplier * offsetAmount,
        });
      }
    } catch (err) {
      throw new Error('Error calculating the scheduled date: ' + err.message);
    }

    let immediatelyRun = false;

    switch (howToHandlePastDates) {
      case 'always-continue':
        if (scheduledAt < DateTime.now()) immediatelyRun = true;
        break;
      case 'continue-if-15-minutes':
        if (scheduledAt < DateTime.now().plus({ minutes: 15 }))
          immediatelyRun = true;
        break;
      case 'continue-if-1-hour':
        if (scheduledAt < DateTime.now().plus({ hours: 1 }))
          immediatelyRun = true;
        break;
      case 'continue-if-1-day':
        if (scheduledAt < DateTime.now().plus({ days: 1 }))
          immediatelyRun = true;
        break;
      case 'continue-if-1-week':
        if (scheduledAt < DateTime.now().plus({ weeks: 1 }))
          immediatelyRun = true;
        break;
      case 'continue-if-1-month':
        if (scheduledAt < DateTime.now().plus({ months: 1 }))
          immediatelyRun = true;
        break;
    }

    return {
      scheduledAt: scheduledAt.toUTC().toISO({ suppressMilliseconds: true }),
      immediatelyRun,
    };
  },
  mockRun: async () => {
    return {
      scheduledAt: '2024-09-01T00:00:00Z',
      immediatelyRun: false,
    };
  },
});

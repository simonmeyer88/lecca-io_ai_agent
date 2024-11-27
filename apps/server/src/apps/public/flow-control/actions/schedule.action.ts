import { DateTime } from 'luxon';
import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  ActionResponse,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { NodeViewOptions } from '@/apps/lib/trigger';
import { parseDateToISO } from '@/apps/utils/parse-date-to-iso';
import { ServerConfig } from '@/config/server.config';
import { ExecutionNodeForRunner } from '@/modules/core/workflow-runner/workflow-runner.service';

import { FlowControl } from '../flow-control.app';

export class Schedule extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: FlowControl;
  id = 'flow-control_action_schedule';
  needsConnection = false;
  name = 'Schedule';
  iconUrl: null | string =
    `${ServerConfig.INTEGRATION_ICON_BASE_URL}/actions/${this.id}.svg`;
  description = 'Pauses the execution and resumes at the scheduled time.';
  availableForAgent = false;
  viewOptions: NodeViewOptions = {
    showManualInputButton: true,
    manualInputButtonOptions: {
      label: 'Manually Resume',
      tooltip:
        'Instead of waiting for the schedule to resume, you can manually resume the execution.',
    },
    saveButtonOptions: {
      hideSaveAndTestButton: true,
    },
  };
  aiSchema = z.object({});
  isInterruptingAction = true;

  handleInterruptingResponse({
    runResponse,
  }: {
    runResponse: Response;
  }): ActionResponse<unknown> {
    if (runResponse?.immediatelyRun) {
      return {
        success: runResponse,
      };
    } else {
      return {
        scheduled: runResponse,
      };
    }
  }

  inputConfig: InputConfig[] = [
    {
      id: 'resumeExecution',
      inputType: 'resume-execution',
      description: '',
      label: '',
    },
    {
      id: 'referenceDate',
      label: 'Reference Date',
      description:
        'The date that will be used to calculate when to resume the execution.',
      inputType: 'date-time',
      required: {
        missingMessage: 'Reference Date is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'offsetType',
      label: 'Offset?',
      inputType: 'select',
      description:
        'If there is an offset, should it be before or after the reference date?',
      hideCustomTab: true,
      selectOptions: [
        {
          label: 'No offset',
          value: 'no-offset',
        },
        {
          label: 'Before',
          value: 'before',
        },
        {
          label: 'After',
          value: 'after',
        },
      ],
      defaultValue: 'no-offset',
      required: {
        missingMessage: 'Offset is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'offsetUnit',
      label: 'Offset Unit',
      inputType: 'select',
      description: 'The unit of time to offset the reference date.',
      defaultValue: 'days',
      hideCustomTab: true,
      selectOptions: [
        {
          label: 'Minutes',
          value: 'minutes',
        },
        {
          label: 'Hours',
          value: 'hours',
        },
        {
          label: 'Days',
          value: 'days',
        },
        {
          label: 'Weeks',
          value: 'weeks',
        },
        {
          label: 'Months',
          value: 'months',
        },
      ],
      loadOptions: {
        dependsOn: [
          {
            id: 'offsetType',
            value: 'before',
          },
        ],
      },
    },
    {
      id: 'offsetUnit',
      label: 'Offset Unit',
      inputType: 'select',
      description: 'The unit of time to offset the reference date.',
      defaultValue: 'days',
      hideCustomTab: true,
      selectOptions: [
        {
          label: 'Minutes',
          value: 'minutes',
        },
        {
          label: 'Hours',
          value: 'hours',
        },
        {
          label: 'Days',
          value: 'days',
        },
        {
          label: 'Weeks',
          value: 'weeks',
        },
        {
          label: 'Months',
          value: 'months',
        },
      ],
      loadOptions: {
        dependsOn: [
          {
            id: 'offsetType',
            value: 'after',
          },
        ],
      },
    },
    {
      id: 'offsetAmount',
      label: 'Offset Amount',
      description: 'The amount of time to offset the reference date.',
      inputType: 'number',
      hideCustomTab: true,
      defaultValue: 1,
      numberOptions: {
        min: 1,
        step: 1,
      },
      loadOptions: {
        dependsOn: [
          {
            id: 'offsetType',
            value: 'before',
          },
        ],
      },
    },
    {
      id: 'offsetAmount',
      label: 'Offset Amount',
      description: 'The amount of time to offset the reference date.',
      inputType: 'number',
      hideCustomTab: true,
      numberOptions: {
        min: 1,
        step: 1,
      },
      defaultValue: 1,
      loadOptions: {
        dependsOn: [
          {
            id: 'offsetType',
            value: 'after',
          },
        ],
      },
    },
    {
      id: 'howToHandlePastDates',
      label: 'How to handle past dates?',
      inputType: 'select',
      hideCustomTab: true,
      selectOptions: [
        {
          label: 'Always continue',
          value: 'always-continue',
        },
        {
          label: `Continue if it's up to 15 minutes`,
          value: 'continue-if-15-minutes',
        },
        {
          label: `Continue if it's up to 1 hour`,
          value: 'continue-if-1-hour',
        },
        {
          label: `Continue if it's up to 1 day`,
          value: 'continue-if-1-day',
        },
        {
          label: `Continue if it's up to 1 week`,
          value: 'continue-if-1-week',
        },
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
    },
  ];

  async run({
    configValue,
    executionId,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
    if (!configValue) {
      configValue = {} as ConfigValue;
    }

    if (configValue.resumeExecution) {
      //Manualy Input to Resume was made.
      //1. We will update the node's executionStatus to 'SUCCESS'
      //2. Manually run the execution again to start the execution again, but it will start from the latest "SUCCESS" nodes

      const executionWithNodes = await this.app.prisma.execution.findFirst({
        where: {
          id: executionId,
        },
        select: {
          nodes: true,
        },
      });

      const updatedNodes = (
        executionWithNodes.nodes as ExecutionNodeForRunner[]
      ).map((node) => {
        if (node.id === configValue.nodeId) {
          return {
            ...node,
            output: {
              ...node.output,
              //TODO: MAYBE ADD WHO MADE THE DECISION
            },
            executionStatus: 'SUCCESS',
          };
        }

        return node;
      });

      await this.app.prisma.execution.update({
        where: {
          id: executionId,
        },
        data: {
          nodes: updatedNodes,
          /**
           * Setting the executionStatus of the node to SUCCESS will allow the execution runner to continue beyond this node.
           * We set the nextScheduledExecution to null so that the execution doesn't trigger again off a schedule (not that it will because it will not be in "SCHEDULED" status). But keeps it clean.
           */
          continueExecutionAt: null,
          status: 'RUNNING',
        },
        select: {
          id: true,
        },
      });

      //Don't need to return anything. We already updated the execution node with the
      //paths to take. The initiator of this run (webhook.service -> handleExecutionWebhookEvent) will
      //run the execution again if this is true.
      return true as any;
    } else {
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
          if (scheduledAt < DateTime.now()) {
            immediatelyRun = true;
          }
          break;
        case 'continue-if-15-minutes':
          if (scheduledAt < DateTime.now().plus({ minutes: 15 })) {
            immediatelyRun = true;
          }
          break;
        case 'continue-if-1-hour':
          if (scheduledAt < DateTime.now().plus({ hours: 1 })) {
            immediatelyRun = true;
          }
          break;
        case 'continue-if-1-day':
          if (scheduledAt < DateTime.now().plus({ days: 1 })) {
            immediatelyRun = true;
          }
          break;
        case 'continue-if-1-week':
          if (scheduledAt < DateTime.now().plus({ weeks: 1 })) {
            immediatelyRun = true;
          }
          break;
        case 'continue-if-1-month':
          if (scheduledAt < DateTime.now().plus({ months: 1 })) {
            immediatelyRun = true;
          }
          break;
        default:
          break;
      }

      return {
        scheduledAt: scheduledAt.toUTC().toISO({ suppressMilliseconds: true }), //Suppress doesn't matter, but makes output cleaner
        immediatelyRun,
      };
    }
  }

  async mockRun(): Promise<Response> {
    //Mock is not available for this action anyway, so doesn't matter.
    return {
      scheduledAt: '2024-09-01T00:00:00Z',
      immediatelyRun: false,
    };
  }
}

type Response = {
  scheduledAt: string;
  immediatelyRun: boolean;
};

type ConfigValue = z.infer<Schedule['aiSchema']> & {
  referenceDate: string;
  offsetType: 'no-offset' | 'before' | 'after';
  offsetAmount: number;
  offsetUnit: 'minutes' | 'hours' | 'days' | 'weeks' | 'months';
  howToHandlePastDates:
    | 'always-continue'
    | 'continue-if-15-minutes'
    | 'continue-if-1-hour'
    | 'continue-if-1-day'
    | 'continue-if-1-week'
    | 'continue-if-1-month';

  /**
   * Used to override the schedule
   */
  resumeExecution?: boolean;
  nodeId?: string;
};

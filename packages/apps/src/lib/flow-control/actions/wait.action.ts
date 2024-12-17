import { createAction } from '@lecca-io/toolkit';
import {
  createMarkdownField,
  createNumberInputField,
  createSelectInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

export const wait = createAction({
  id: 'flow-control_action_wait',
  name: 'Wait',
  description: 'Pauses the execution for a period of time before continuing.',
  iconUrl: `https://lecca-io.s3.us-east-2.amazonaws.com/assets/actions/flow-control_action_wait.svg`,
  availableForAgent: false,
  viewOptions: {
    saveButtonOptions: {
      hideSaveAndTestButton: true,
    },
  },
  aiSchema: z.object({
    timeUnit: z.enum(['seconds', 'minutes', 'hours', 'days']),
    timeValue: z.string(),
  }),
  handleInterruptingResponse: ({ runResponse }: any) => {
    if (!runResponse?.scheduledAt) {
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
    createSelectInputField({
      id: 'timeUnit',
      description: 'The unit of time to wait.',
      label: 'Time Unit',
      hideCustomTab: true,
      selectOptions: [
        { label: 'Seconds', value: 'seconds' },
        { label: 'Minutes', value: 'minutes' },
        { label: 'Hours', value: 'hours' },
        { label: 'Days', value: 'days' },
      ],
      defaultValue: 'minutes',
      required: {
        missingMessage: 'Time unit is required.',
        missingStatus: 'warning',
      },
    }),
    createNumberInputField({
      id: 'timeValue',
      description: 'The number of time units to wait before continuing.',
      label: 'Time to Wait',
      numberOptions: {
        min: 1,
        step: 1,
      },
      required: {
        missingMessage: 'Time to wait is required.',
        missingStatus: 'warning',
      },
      defaultValue: '30',
      loadOptions: {
        dependsOn: ['timeUnit'],
      },
    }),
    createMarkdownField({
      id: 'markdown',
      markdown:
        'If the wait time is greater than 2 minutes, the execution status will change to **Scheduled**',
    }),
  ],
  run: async ({ configValue }) => {
    if (!configValue) {
      configValue = {} as any;
    }

    const { timeUnit, timeValue } = configValue;

    const timeValueNumber = Number(timeValue);
    let numberSeconds: number;

    if (!Number.isInteger(timeValueNumber)) {
      throw new Error('Time value must be a whole number.');
    }

    switch (timeUnit) {
      case 'seconds':
        numberSeconds = timeValueNumber;
        break;
      case 'minutes':
        numberSeconds = timeValueNumber * 60;
        break;
      case 'hours':
        numberSeconds = timeValueNumber * 60 * 60;
        break;
      case 'days':
        numberSeconds = timeValueNumber * 60 * 60 * 24;
        break;
      default:
        throw new Error('Invalid time unit: ' + timeUnit);
    }

    if (numberSeconds < 1) {
      throw new Error('Seconds must be greater than 1');
    } else if (numberSeconds <= 120) {
      const response = await new Promise((resolve) => {
        setTimeout(() => {
          resolve({
            secondsToWait: numberSeconds,
          });
        }, numberSeconds * 1000);
      });

      return response;
    } else {
      return {
        scheduledAt: new Date(Date.now() + numberSeconds * 1000).toISOString(),
        secondsToWait: numberSeconds,
      };
    }
  },
  mockRun: async () => {
    return {
      secondsToWait: 5,
    };
  },
});

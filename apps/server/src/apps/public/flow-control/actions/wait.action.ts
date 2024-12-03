import { z } from 'zod';

import { Action, ActionResponse, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { NodeViewOptions } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { FlowControl } from '../flow-control.app';

export class Wait extends Action {
  app: FlowControl;
  id = 'flow-control_action_wait';
  needsConnection = false;
  name = 'Wait';
  iconUrl: null | string =
    `${ServerConfig.INTEGRATION_ICON_BASE_URL}/actions/${this.id}.svg`;
  description = 'Pauses the execution for a period of time before continuing.';
  availableForAgent = false;
  isInterruptingAction = true;
  handleInterruptingResponse({
    runResponse,
  }: {
    runResponse: Response;
  }): ActionResponse<unknown> {
    if (!runResponse?.scheduledAt) {
      return {
        success: runResponse,
      };
    } else {
      return {
        scheduled: runResponse,
      };
    }
  }
  viewOptions: NodeViewOptions = {
    saveButtonOptions: {
      hideSaveAndTestButton: true,
    },
  };
  aiSchema = z.object({});
  inputConfig: InputConfig[] = [
    {
      id: 'timeUnit',
      description: 'The unit of time to wait.',
      inputType: 'select',
      label: 'Time Unit',
      hideCustomTab: true,
      selectOptions: [
        {
          label: 'Seconds',
          value: 'seconds',
        },
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
      ],
      defaultValue: 'minutes',
      required: {
        missingMessage: 'Time unit is required.',
        missingStatus: 'warning',
      },
    },
    {
      id: 'timeValue',
      description: 'The number of time units to wait before continuing.',
      inputType: 'number',
      numberOptions: {
        min: 1,
        step: 1,
      },
      label: 'Time to Wait',
      required: {
        missingMessage: 'Time to wait is required.',
        missingStatus: 'warning',
      },
      defaultValue: '30',
      loadOptions: {
        dependsOn: ['timeUnit'],
      },
    },
    {
      id: 'markdown',
      description: '',
      label: '',
      inputType: 'markdown',
      markdown:
        'If the wait time is greater than 2 minutes, the execution status will change to **Scheduled**',
    },
  ];

  async run({ configValue }: RunActionArgs<ConfigValue>): Promise<unknown> {
    if (!configValue) {
      configValue = {} as ConfigValue;
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
      //We're going to schedule it to run in the future
      //By returning scheduledAt, the handleInterruptingResponse will let the workflow runner know to schedule it
      return {
        scheduledAt: new Date(Date.now() + numberSeconds * 1000).toISOString(),
        secondsToWait: numberSeconds,
      };
    }
  }

  async mockRun(): Promise<unknown> {
    return {
      secondsToWait: 5,
    };
  }
}

type ConfigValue = z.infer<Wait['aiSchema']> & {
  timeUnit: 'seconds' | 'minutes' | 'hours' | 'days';
  timeValue: string;
};

type Response = {
  secondsToWait: number;
  scheduledAt?: string;
};

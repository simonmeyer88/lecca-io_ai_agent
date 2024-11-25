import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { Apify } from '../apify.app';
import { z } from 'zod';

export class RunTask extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: Apify;
  id() {
    return 'apify_action_run-task';
  }
  name() {
    return 'Run Task';
  }
  description() {
    return 'Runs a specified Apify task';
  }
  aiSchema() {
    return z.object({
      taskId: z.string().min(1).describe('The ID of the task to run'),
      schema: z
        .object({})
        .nullable()
        .optional()
        .describe('Ask for any schema overrides to apply to the task as JSON'),
      waitForFinish: z
        .enum(['true', 'false'])
        .nullable()
        .optional()
        .describe('Whether to wait for the task to finish before returning'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      this.app.dynamicListTasks(),
      {
        id: 'waitForFinish',
        label: 'Wait for Finish',
        description:
          'Wait for the task to finish before returning. If waiting, the action will timeout after 60 seconds.',
        inputType: 'switch',
        switchOptions: {
          checked: 'true',
          unchecked: 'false',
          defaultChecked: true,
        },
      },
      {
        id: 'showSchemaMap',
        label: 'Override Input Schema?',
        description: '',
        inputType: 'switch',
        switchOptions: {
          checked: 'true',
          unchecked: 'false',
          defaultChecked: false,
        },
      },
      this.app.dynamicListTaskInputSchema(),
    ];
  }

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<any> {
    const { taskId, waitForFinish, schema, showSchemaMap } = configValue;

    const url = `https://api.apify.com/v2/actor-tasks/${taskId}/${waitForFinish === 'true' ? 'runs' : 'runs'}?timeout=120${waitForFinish === 'true' ? '&waitForFinish=60' : ''}`;

    try {
      if (typeof schema === 'string') {
        JSON.parse(schema);
      }
    } catch (err) {
      throw new Error(`Schema must be a valid JSON object: ${err}`);
    }

    const schemaObject = schema?.reduce(
      (acc, { key, value }: { key: string; value: string }) => {
        acc[key] = value?.trim() ? JSON.parse(value.trim()) : undefined;
        return acc;
      },
      {} as Record<string, string>,
    );

    const result = await this.app.http.loggedRequest({
      method: 'POST',
      url,
      data: showSchemaMap !== 'false' ? schemaObject : {},
      headers: {
        Authorization: `Bearer ${connection.apiKey}`,
      },
      workspaceId,
    });

    if (result) {
      return result.data;
    } else {
      throw new Error(`Failed to run task: ${result?.data?.error}`);
    }
  }

  async mockRun(): Promise<ResponseType> {
    return { data: mockRunDetails };
  }
}

type ResponseType = {
  data: typeof mockRunDetails;
};

type ConfigValue = Omit<z.infer<ReturnType<RunTask['aiSchema']>>, 'schema'> & {
  schema: { key: string; value: string }[]; //Because the AI will pass in an object, but the input config is an array objects
  showSchemaMap: 'true' | 'false';
};

const mockRunDetails = {
  id: 'id',
  actId: 'act-id',
  userId: 'user-id',
  actorTaskId: 'actor-task-id',
  startedAt: '2024-10-03T04:24:52.611Z',
  finishedAt: '2024-10-03T04:25:07.394Z',
  status: 'SUCCEEDED',
  statusMessage: 'Finished! Total 1 requests: 1 succeeded, 0 failed.',
  isStatusMessageTerminal: true,
  meta: {
    origin: 'API',
    userAgent: 'axios/1.6.8',
  },
  stats: {
    inputBodyLen: 1187,
    rebootCount: 0,
    restartCount: 0,
    durationMillis: 14676,
    resurrectCount: 0,
    runTimeSecs: 14.676,
    metamorph: 0,
    computeUnits: 0.016306666666666667,
    memAvgBytes: 763923541.2352298,
    memMaxBytes: 1205739520,
    memCurrentBytes: 38948864,
    cpuAvgUsage: 74.14292050838576,
    cpuMaxUsage: 382.367573964497,
    cpuCurrentUsage: 15.124920913884008,
    netRxBytes: 435696,
    netTxBytes: 49104,
  },
  options: {
    build: 'version-0',
    timeoutSecs: 120,
    memoryMbytes: 4096,
    diskMbytes: 8192,
  },
  buildId: 'build-id',
  exitCode: 0,
  defaultKeyValueStoreId: 'key-value-store-id',
  defaultDatasetId: 'dataset-id',
  defaultRequestQueueId: 'queue-id',
  buildNumber: '0.0.0',
  containerUrl: 'https://1111111111.runs.apify.net',
  usage: {
    ACTOR_COMPUTE_UNITS: 0.016306666666666667,
    DATASET_READS: 0,
    DATASET_WRITES: 1,
    KEY_VALUE_STORE_READS: 1,
    KEY_VALUE_STORE_WRITES: 7,
    KEY_VALUE_STORE_LISTS: 0,
    REQUEST_QUEUE_READS: 1,
    REQUEST_QUEUE_WRITES: 4,
    DATA_TRANSFER_INTERNAL_GBYTES: 0.00038298871368169785,
    DATA_TRANSFER_EXTERNAL_GBYTES: 0.00003790203481912613,
    PROXY_RESIDENTIAL_TRANSFER_GBYTES: 0,
    PROXY_SERPS: 0,
  },
  usageTotalUsd: 0.0069933965093145764,
  usageUsd: {
    ACTOR_COMPUTE_UNITS: 0.006522666666666667,
    DATASET_READS: 0,
    DATASET_WRITES: 0.000005,
    KEY_VALUE_STORE_READS: 0.000005,
    KEY_VALUE_STORE_WRITES: 0.00035,
    KEY_VALUE_STORE_LISTS: 0,
    REQUEST_QUEUE_READS: 0.000004,
    REQUEST_QUEUE_WRITES: 0.00008,
    DATA_TRANSFER_INTERNAL_GBYTES: 0.000019149435684084895,
    DATA_TRANSFER_EXTERNAL_GBYTES: 0.000007580406963825226,
    PROXY_RESIDENTIAL_TRANSFER_GBYTES: 0,
    PROXY_SERPS: 0,
  },
};

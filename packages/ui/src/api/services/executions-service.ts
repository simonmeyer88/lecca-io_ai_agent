import { z } from 'zod';

import { Execution, executionSchema } from '../../models/execution-model';
import { ApiLibrary, ApiLibraryConfig, appQueryClient } from '../api-library';
import { ApiLibraryHelper } from '../api-library-helpers';

export default class ExecutionsService extends ApiLibraryHelper {
  protected schema = executionSchema;
  protected path = '/executions';
  protected serviceName = 'executions' as keyof ApiLibrary;

  manuallyExecuteWorkflow({
    workflowId,
    inputData,
    config,
  }: {
    workflowId: string;
    inputData?: Record<string, string | number>;
    config?: ApiLibraryConfig;
  }) {
    return super.apiFetch<Execution>({
      httpMethod: 'post',
      mockConfig: { schema: null },
      path: `${this.path}/workflows/${workflowId}/execute`,
      data: { inputData: inputData ?? {} },
      config,
      onSuccess: async () => {
        await appQueryClient.invalidateQueries({
          queryKey: [this.serviceName, 'getList'],
        });
      },
    });
  }

  getList(args?: { config?: ApiLibraryConfig }) {
    return super._getList<Execution[]>({
      config: {
        ...args?.config,
        params: {
          expansion: [
            'createdAt',
            'startedAt',
            'stoppedAt',
            'executionNumber',
            'status',
            'statusMessage',
            'workflow',
            'project',
          ],
          ...args?.config?.params,
        },
      },
    });
  }

  getById({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super._getById<Execution>({
      id,
      config: {
        ...config,
        params: {
          expansion: [
            'startedAt',
            'updatedAt',
            'stoppedAt',
            'executionNumber',
            'edges',
            'nodes',
            'status',
            'statusMessage',
            'workflow',
            'project',
            'output',
            'orientation',
            'continueExecutionAt',
          ],
          ...config?.params,
        },
      },
    });
  }

  delete({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super._delete<boolean>({
      id,
      config,
    });
  }

  checkIfExecutionUpdatedAtHasChanged({
    id,
    executionUpdatedAt,
  }: {
    id: string;
    executionUpdatedAt: string;
  }) {
    return super.apiFetch<{ hasChanged: boolean }>({
      httpMethod: 'get',
      path: `${this.path}/${id}/hasUpdates?updatedAt=${executionUpdatedAt}`,
      mockConfig: { schema: z.object({ hasUpdates: z.boolean() }) },
    });
  }

  sendManualInput({
    executionId,
    nodeId,
    data,
    config,
  }: {
    executionId: string;
    nodeId: string;
    data?: Record<string, string | number>;
    config?: ApiLibraryConfig;
  }) {
    return super.apiFetch<Execution>({
      httpMethod: 'post',
      mockConfig: { schema: null },
      path: `/webhooks${this.path}/${executionId}/nodes/${nodeId}/input`,
      data,
      config,
    });
  }
}

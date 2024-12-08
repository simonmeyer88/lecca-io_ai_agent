import {
  CreateWorkflowType,
  UpdateWorkflowType,
  Workflow,
  workflowSchema,
} from '@/models/workflow/workflow-model';

import { ApiLibrary, ApiLibraryConfig, appQueryClient } from '../api-library';
import { ApiLibraryHelper } from '../api-library-helpers';
import { WORKFLOW_MOCK } from '../mocks/workflow-mock';

export default class WorkflowsService extends ApiLibraryHelper {
  protected schema = workflowSchema;
  protected path = '/workflows';
  protected serviceName = 'workflows' as keyof ApiLibrary;

  create({
    data,
    projectId,
    config,
  }: {
    data: CreateWorkflowType;
    projectId: string;
    config?: ApiLibraryConfig;
  }) {
    return super.apiFetch<Workflow>({
      httpMethod: 'post',
      mockConfig: {
        schema: workflowSchema,
        mockData: WORKFLOW_MOCK,
      },
      path: `/projects/${projectId}/workflows`,
      data,
      onSuccess: async () => {
        await Promise.all([
          appQueryClient.invalidateQueries({
            queryKey: [this.serviceName, 'getList'],
          }),
          appQueryClient.invalidateQueries({
            queryKey: [this.serviceName, 'getRecentWorkflowsForUser'],
          }),
        ]);
      },
      config,
    });
  }

  getList(args?: { config?: ApiLibraryConfig }) {
    return super._getList<Workflow[]>({
      config: {
        ...args?.config,
        params: {
          expansion: [
            'createdAt',
            'updatedAt',
            'isActive',
            'isInternal',
            'description',
            'project',
            'triggerAndActionIds',
          ],
          includeType: ['internal'],
          ...args?.config?.params,
        },
      },
    });
  }

  getById({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super.apiFetch<Workflow>({
      httpMethod: 'get',
      mockConfig: {
        schema: null,
        mockData: WORKFLOW_MOCK,
      },
      path: `${this.path}/${id}`,
      config: {
        ...config,
        params: {
          expansion: [
            'createdAt',
            'updatedAt',
            'isActive',
            'description',
            'project',
            'edges',
            'nodes',
            'orientation',
            'nextScheduledExecution',
            'triggerAndActionIds',
          ],
          ...config?.params,
        },
      },
    });
  }

  update({
    id,
    data,
    config,
  }: {
    id: string;
    data: UpdateWorkflowType;
    config?: ApiLibraryConfig;
  }) {
    return super._update<Workflow>({
      id,
      data,
      config: {
        ...config,
        options: {
          ...config?.options,
          additionalOnSuccess: async () => {
            await Promise.all([
              appQueryClient.invalidateQueries({
                queryKey: [this.serviceName, 'getRecentWorkflowsForUser'],
              }),
            ]);
          },
        },
      },
    });
  }

  delete({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super._delete<boolean>({
      id,
      config: {
        ...config,
        options: {
          ...config?.options,
          additionalOnSuccess: async () => {
            await Promise.all([
              appQueryClient.invalidateQueries({
                queryKey: [this.serviceName, 'getRecentWorkflowsForUser'],
              }),
            ]);
          },
        },
      },
    });
  }

  /**
   * @description Get's a list of recent workflows this user has interacted with.
   */
  getRecentWorkflowsForUser({ config }: { config?: ApiLibraryConfig }) {
    return super.apiFetch<Workflow[]>({
      httpMethod: 'get',
      mockConfig: {
        schema: workflowSchema,
        isArray: true,
      },
      path: `${this.path}/recent-for-workspace-user`,
      config: {
        ...config,
        params: {
          expansion: [
            'createdAt',
            'updatedAt',
            'isActive',
            'description',
            'project',
            'edges',
            'nodes',
            'triggerAndActionIds',
          ],
          ...config?.params,
        },
      },
    });
  }

  setTestingWebhookToTrue({ id }: { id: string; config?: ApiLibraryConfig }) {
    return super.apiFetch<void>({
      httpMethod: 'post',
      mockConfig: {
        schema: null,
      },
      path: `${this.path}/${id}/testing-webhook-trigger`,
    });
  }

  getTestWebhookData({ id }: { id: string; config?: ApiLibraryConfig }) {
    return super.apiFetch<{ hasData: boolean; data: undefined | unknown }>({
      httpMethod: 'get',
      mockConfig: {
        schema: null,
      },
      path: `${this.path}/${id}/test-webhook-data`,
    });
  }

  checkForLatestPllingItemAndRun({
    workflowId,
    config,
  }: {
    workflowId: string;
    config?: ApiLibraryConfig;
  }) {
    return super.apiFetch<{ executionIds: string[] }>({
      httpMethod: 'post',
      mockConfig: { schema: null },
      path: `${this.path}/${workflowId}/checkAndRun`,
      data: {},
      config,
      onSuccess: async () => {
        await appQueryClient.invalidateQueries({
          queryKey: ['executions', 'getList'],
        });
      },
    });
  }
}

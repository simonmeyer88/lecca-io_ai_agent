import { z } from 'zod';

import {
  CreateWorkflowAppActionType,
  workflowAppActionSchema,
} from '../../models/workflow/workflow-app-action-model';
import {
  CreateWorkflowAppType,
  UpdateWorkflowAppType,
  WorkflowApp,
  workflowAppSchema,
} from '../../models/workflow/workflow-app-model';
import { ApiLibrary, ApiLibraryConfig, appQueryClient } from '../api-library';
import { ApiLibraryHelper } from '../api-library-helpers';
import { WORKFLOW_APPS_MOCK } from '../mocks/workflow-apps-mock';

export default class WorkflowAppsService extends ApiLibraryHelper {
  protected schema = workflowAppSchema;
  protected path = '/workflow-apps';
  protected serviceName = 'workflow-apps' as keyof ApiLibrary;

  async getList(args?: { config?: ApiLibraryConfig }) {
    const response = await super.apiFetch<WorkflowApp[]>({
      path: this.path,
      httpMethod: 'get',
      mockConfig: {
        schema: null,
        mockData: WORKFLOW_APPS_MOCK,
      },
      config: args?.config,
    });

    return response;
  }

  async retrieveActionDynamicValues({
    appId,
    actionId,
    data,
    projectId,
    workflowId,
    agentId,
    config,
    extraOptions,
  }: {
    appId: string;
    actionId: string;
    data: {
      fieldId: string;
      connectionId: string;
    };
    projectId: string;
    workflowId: string | undefined;
    agentId: string | undefined;
    config?: ApiLibraryConfig;
    extraOptions?: Record<string, any>;
  }) {
    return super.apiFetch<
      {
        label: string;
        value: string;
      }[]
    >({
      httpMethod: 'post',
      path: `${this.path}/${appId}/actions/${actionId}/dynamic-values`,
      mockConfig: {
        schema: z.object({
          label: z.string(),
          value: z.string(),
        }),
        isArray: true,
      },
      data: {
        ...data,
        projectId,
        workflowId,
        agentId,
        extraOptions,
      },
      config,
    });
  }

  async retrieveTriggerDynamicValues({
    appId,
    triggerId,
    data,
    projectId,
    workflowId,
    agentId,
    config,
    extraOptions,
  }: {
    appId: string;
    triggerId: string;
    data: {
      fieldId: string;
      connectionId: string;
    };
    projectId: string;
    workflowId: string | undefined;
    agentId: string | undefined;
    config?: ApiLibraryConfig;
    extraOptions?: Record<string, any>;
  }) {
    return super.apiFetch<
      {
        label: string;
        value: string;
      }[]
    >({
      httpMethod: 'post',
      path: `${this.path}/${appId}/triggers/${triggerId}/dynamic-values`,
      mockConfig: {
        schema: z.object({
          label: z.string(),
          value: z.string(),
        }),
        isArray: true,
      },
      data: {
        ...data,
        projectId,
        workflowId,
        agentId,
        extraOptions,
      },
      config,
    });
  }

  async runNode({
    workflowId,
    nodeId,
    config,
    shouldMock,
    skipValidatingConditions,
  }: {
    workflowId: string;
    nodeId: string;
    config?: ApiLibraryConfig;
    shouldMock?: boolean;
    skipValidatingConditions?: boolean;
  }) {
    return super.apiFetch<any>({
      httpMethod: 'post',
      path: `${this.path}/runNode`,
      mockConfig: {
        schema: null,
      },
      data: {
        workflowId,
        nodeId,
        shouldMock,
        skipValidatingConditions,
      },
      config,
    });
  }

  async connectApp({
    appId,
    connectionId,
    data,
    config,
  }: {
    appId: string;
    connectionId: string;
    data: Record<string, unknown>;
    config?: ApiLibraryConfig;
  }) {
    return super.apiFetch<{ authorizeUrl: string }>({
      httpMethod: 'post',
      path: `${this.path}/${appId}/connections/${connectionId}/connect`,
      mockConfig: {
        schema: null,
      },
      data,
      config,
      onSuccess: async () => {
        await appQueryClient.invalidateQueries({
          queryKey: ['connections', 'getList'],
        });
      },
    });
  }

  /**All the services below will be used once we have support for custom apps */

  async create({
    data,
    config,
  }: {
    data: CreateWorkflowAppType;
    config?: ApiLibraryConfig;
  }) {
    return super._create<WorkflowApp>({ data, config });
  }

  async update({
    id,
    data,
    config,
  }: {
    id: string;
    data: UpdateWorkflowAppType;
    config?: ApiLibraryConfig;
  }) {
    return super._update<WorkflowApp>({ id, data, config });
  }

  async delete({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super._delete<boolean>({ id, config });
  }

  async getById({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    const response = await super.apiFetch<WorkflowApp>({
      path: `${this.path}/${id}`,
      httpMethod: 'get',
      mockConfig: {
        schema: null,
        mockData: WORKFLOW_APPS_MOCK[0],
      },
      config: config,
    });

    return response;
  }

  async createAction({
    workflowAppId,
    data,
    config,
  }: {
    workflowAppId: string;
    data: CreateWorkflowAppActionType;
    config?: ApiLibraryConfig;
  }) {
    return super.apiFetch<WorkflowApp>({
      httpMethod: 'post',
      path: `${this.path}/${workflowAppId}/actions`,
      mockConfig: {
        schema: workflowAppActionSchema,
      },
      data,
      config,
    });
  }

  async updateAction({
    actionId,
    workflowAppId,
    data,
    config,
  }: {
    actionId: string;
    workflowAppId: string;
    data: CreateWorkflowAppActionType;
    config?: ApiLibraryConfig;
  }) {
    return super.apiFetch<WorkflowApp>({
      httpMethod: 'put',
      path: `${this.path}/${workflowAppId}/actions/${actionId}`,
      mockConfig: {
        schema: workflowAppActionSchema,
      },
      data,
      config,
    });
  }

  async deleteAction({
    actionId,
    workflowAppId,
    config,
  }: {
    actionId: string;
    workflowAppId: string;
    config?: ApiLibraryConfig;
  }) {
    return super.apiFetch<WorkflowApp>({
      httpMethod: 'delete',
      path: `${this.path}/${workflowAppId}/actions/${actionId}`,
      mockConfig: {
        schema: workflowAppActionSchema,
      },
      config,
    });
  }
}

import {
  UpdateWorkflowTemplateType,
  WorkflowTemplate,
  workflowTemplateSchema,
} from '../../models/workflow-template-model';
import { ApiLibrary, ApiLibraryConfig, appQueryClient } from '../api-library';
import { ApiLibraryHelper } from '../api-library-helpers';

export default class WorkflowTemplatesService extends ApiLibraryHelper {
  protected schema = null;
  protected path = '/workflow-templates';
  protected serviceName = 'workflowTemplates' as keyof ApiLibrary;

  async create({
    data,
    config,
  }: {
    data: {
      workflowId: string;
      projectId: string | undefined;
    };
    config?: ApiLibraryConfig;
  }) {
    return super._create<WorkflowTemplate>({ data, config });
  }

  async getSharedList(args: {
    config: ApiLibraryConfig & {
      sharedToType: 'workspace' | 'global';
    };
  }) {
    return super.apiFetch<WorkflowTemplate[]>({
      httpMethod: 'get',
      path: `${this.path}/shared?sharedToType=${args.config.sharedToType}`,
      mockConfig: {
        schema: null,
      },
    });
  }

  async getList(args?: { config?: ApiLibraryConfig }) {
    return super._getList<WorkflowTemplate[]>({
      config: {
        ...args?.config,
        params: {
          expansion: [
            'createdAt',
            'updatedAt',
            'description',
            'project',
            'triggerAndActionIds',
            'sharedTo',
          ],
          ...args?.config?.params,
        },
      },
    });
  }

  async getSharedById({
    id,
    config,
  }: {
    id: string;
    config?: ApiLibraryConfig;
  }) {
    return super.apiFetch<WorkflowTemplate[]>({
      httpMethod: 'get',
      path: `${this.path}/${id}/shared`,
      config,
      mockConfig: {
        schema: null,
      },
    });
  }

  async getById({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super._getById<WorkflowTemplate>({
      id,
      config: {
        ...config,
        params: {
          expansion: [
            'createdAt',
            'updatedAt',
            'description',
            'edges',
            'nodes',
            'project',
            'triggerAndActionIds',
            'sharedTo',
          ],
          ...config?.params,
        },
      },
    });
  }

  async update({
    id,
    data,
    config,
  }: {
    id: string;
    data: UpdateWorkflowTemplateType;
    config?: ApiLibraryConfig;
  }) {
    return super._update<WorkflowTemplate>({ id, data, config });
  }

  async delete({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super._delete<boolean>({
      id,
      config: {
        ...config,
        options: {
          ...config?.options,
          additionalOnSuccess: async () => {
            await Promise.all([
              appQueryClient.invalidateQueries({
                queryKey: [this.serviceName, 'getSharedList'],
              }),
            ]);
          },
        },
      },
    });
  }

  async shareToWorkspace({
    id,
    config,
  }: {
    id: string;
    config?: ApiLibraryConfig;
  }) {
    return super.apiFetch<WorkflowTemplate[]>({
      httpMethod: 'post',
      path: `${this.path}/${id}/shareToWorkspace`,
      config,
      mockConfig: {
        schema: workflowTemplateSchema,
      },
      onSuccess: async () => {
        await Promise.all([
          appQueryClient.invalidateQueries({
            queryKey: [this.serviceName, 'getList'],
          }),
          appQueryClient.invalidateQueries({
            queryKey: [this.serviceName, 'getSharedList'],
          }),
        ]);
      },
    });
  }

  async shareGlobally({
    id,
    config,
  }: {
    id: string;
    config?: ApiLibraryConfig;
  }) {
    return super.apiFetch<WorkflowTemplate[]>({
      httpMethod: 'post',
      path: `${this.path}/${id}/shareGlobally`,
      config,
      mockConfig: {
        schema: workflowTemplateSchema,
      },
      onSuccess: async () => {
        await Promise.all([
          appQueryClient.invalidateQueries({
            queryKey: [this.serviceName, 'getList'],
          }),
          appQueryClient.invalidateQueries({
            queryKey: [this.serviceName, 'getSharedList'],
          }),
        ]);
      },
    });
  }
}

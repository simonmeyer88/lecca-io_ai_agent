import {
  Agent,
  CreateAgentType,
  UpdateAgentType,
  agentSchema,
} from '@/models/agent/agent-model';
import { MessageTaskType } from '@/models/task/task-model';

import { ApiLibrary, ApiLibraryConfig, appQueryClient } from '../api-library';
import { ApiLibraryHelper } from '../api-library-helpers';

export default class AgentsService extends ApiLibraryHelper {
  protected schema = agentSchema;
  protected path = '/agents';
  protected serviceName = 'agents' as keyof ApiLibrary;

  create({
    data,
    projectId,
    config,
  }: {
    data: CreateAgentType;
    projectId: string;
    config?: ApiLibraryConfig;
  }) {
    return super.apiFetch<Agent>({
      httpMethod: 'post',
      mockConfig: {
        schema: agentSchema,
      },
      path: `/projects/${projectId}/agents`,
      data,
      onSuccess: async () => {
        await Promise.all([
          appQueryClient.invalidateQueries({
            queryKey: [this.serviceName, 'getList'],
          }),
        ]);
      },
      config,
    });
  }

  message({
    agentId,
    data,
    config,
  }: {
    agentId: string;
    data: MessageTaskType;
    config?: ApiLibraryConfig;
  }) {
    return super.apiFetch({
      path: `/agents/${agentId}/message`,
      httpMethod: 'post',
      mockConfig: {
        schema: null,
      },
      config,
      data: data,
    });
  }

  getList(args?: { config?: ApiLibraryConfig }) {
    return super._getList<Agent[]>({
      config: {
        ...args?.config,
        params: {
          expansion: [
            'createdAt',
            'updatedAt',
            'description',
            'project',
            'connections',
            'knowledge',
          ],
          ...args?.config?.params,
        },
      },
    });
  }

  getById({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super.apiFetch<Agent>({
      httpMethod: 'get',
      mockConfig: {
        schema: agentSchema,
      },
      path: `${this.path}/${id}`,
      config: {
        ...config,
        params: {
          expansion: [
            'createdAt',
            'updatedAt',
            'description',
            'project',
            'instructions',
            'maxRetries',
            'frequencyPenalty',
            'maxTokens',
            'maxToolRoundtrips',
            'presencePenalty',
            'seed',
            'temperature',
            'topP',
            'tools',
            'triggers',
            'connections',
            'actions',
            'knowledge',
            'variables',
            'workflows',
            'subAgents',
            'webAccess',
            'phoneAccess',
            'llmConnection',
            'llmModel',
            'llmProvider',
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
    data: UpdateAgentType;
    config?: ApiLibraryConfig;
  }) {
    return super._update<Agent>({
      id,
      data,
      config,
    });
  }

  delete({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super._delete<boolean>({
      id,
      config,
    });
  }
}

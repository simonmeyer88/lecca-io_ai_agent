import {
  CreateKnowledgeType,
  Knowledge,
  UpdateKnowledgeType,
  UploadFileKnowledgeType,
  knowledgeSchema,
} from '@/models/knowledge-model';
import { KnowledgeVectorRef } from '@/models/knowledge-vector-ref-model';

import { ApiLibrary, ApiLibraryConfig, appQueryClient } from '../api-library';
import { ApiLibraryHelper } from '../api-library-helpers';

export default class KnowledgeService extends ApiLibraryHelper {
  protected schema = knowledgeSchema;
  protected path = '/knowledge';
  protected serviceName = 'knowledge' as keyof ApiLibrary;

  create({
    data,
    config,
  }: {
    data: CreateKnowledgeType;
    config?: ApiLibraryConfig;
  }) {
    return super._create<Knowledge>({
      data,
      config,
    });
  }

  getList(args?: { config?: ApiLibraryConfig }) {
    return super._getList<Knowledge[]>({
      config: {
        ...args?.config,
        params: {
          expansion: [
            'createdAt',
            'updatedAt',
            'project',
            'description',
            'countVectorRefs',
          ],
          includeType: ['all'],
          ...args?.config?.params,
        },
      },
    });
  }

  getById({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super._getById<Knowledge>({
      id,
      config: {
        ...config,
        params: {
          expansion: [
            'createdAt',
            'updatedAt',
            'project',
            'description',
            'chunkSize',
            'chunkOverlap',
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
    data: UpdateKnowledgeType;
    config?: ApiLibraryConfig;
  }) {
    return super._update<Knowledge>({
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

  saveUploadedTextToKnowledge({
    knowledgeId,
    config,
    data,
  }: {
    knowledgeId: string;
    config?: ApiLibraryConfig;
    data: UploadFileKnowledgeType;
  }) {
    //Will return the vectorRefId. If there are additional chunks to upload
    //we'll use the vectorRefId and call saveUploadedTextToExistingKnowledgeVectorRef

    return this.apiFetch<{ vectorRefGroupId: string }>({
      httpMethod: 'post',
      mockConfig: {
        schema: null,
      },
      path: `${this.path}/${knowledgeId}/saveUploadedText`,
      config,
      data,
      onSuccess: async () => {
        appQueryClient.invalidateQueries({
          queryKey: [this.serviceName, 'getVectorRefs'],
        });
      },
    });
  }

  getVectorRefs({
    knowledgeId,
    config,
  }: {
    knowledgeId: string;
    config?: ApiLibraryConfig;
  }) {
    return this.apiFetch<KnowledgeVectorRef[]>({
      httpMethod: 'get',
      path: `${this.path}/${knowledgeId}/vectorRefs`,
      mockConfig: {
        schema: null,
      },
      config,
    });
  }

  getVectorRefData({
    knowledgeId,
    vectorRefId,
    config,
  }: {
    knowledgeId: string;
    vectorRefId: string;
    config?: ApiLibraryConfig;
  }) {
    return this.apiFetch<string>({
      httpMethod: 'get',
      path: `${this.path}/${knowledgeId}/vectorRefs/${vectorRefId}`,
      mockConfig: {
        schema: null,
      },
      config,
    });
  }

  deleteVectorRef({
    knowledgeId,
    vectorRefId,
    config,
  }: {
    knowledgeId: string;
    vectorRefId: string;
    config?: ApiLibraryConfig;
  }) {
    return this.apiFetch({
      httpMethod: 'delete',
      path: `${this.path}/${knowledgeId}/vectorRefs/${vectorRefId}`,
      mockConfig: {
        schema: null,
      },
      config,
      onSuccess: async () => {
        await Promise.all([
          appQueryClient.invalidateQueries({
            queryKey: [this.serviceName, 'getVectorRefs'],
          }),
        ]);
      },
    });
  }

  deleteVectorRefGroupByVectorRefId({
    knowledgeId,
    vectorRefId,
    config,
  }: {
    knowledgeId: string;
    vectorRefId: string;
    config?: ApiLibraryConfig;
  }) {
    return this.apiFetch({
      httpMethod: 'delete',
      path: `${this.path}/${knowledgeId}/vectorRefs/${vectorRefId}/vectorRefGroup`,
      mockConfig: {
        schema: null,
      },
      config,
      onSuccess: async () => {
        //We do the deletion async on the backend so we can't invalidate immediately in the client.
        await Promise.all([
          appQueryClient.invalidateQueries({
            queryKey: [this.serviceName, 'getVectorRefs'],
          }),
        ]);
      },
    });
  }
}

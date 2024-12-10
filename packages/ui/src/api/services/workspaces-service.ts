import {
  CreateWorkspaceType,
  UpdateWorkspaceType,
  Workspace,
  workspaceSchema,
} from '../../models/workspace-model';
import { ApiLibrary, ApiLibraryConfig, appQueryClient } from '../api-library';
import { ApiLibraryHelper } from '../api-library-helpers';

/**
 * A default "Personal Workspace" will be created for each user upon registration by the server
 * You can always assume there is an active workspace for a user.
 */

export default class WorkspacesService extends ApiLibraryHelper {
  protected schema = workspaceSchema;
  protected path = '/workspaces';
  protected serviceName = 'workspaces' as keyof ApiLibrary;

  /**
   * @description Returns the active workspace of the user.
   */
  getMe(args?: { config?: ApiLibraryConfig }) {
    return super._getMe<Workspace>({
      config: args?.config,
    });
  }

  /**
   * @description Updates the workspace's details.
   */
  updateMe({
    data,
    config,
  }: {
    data: UpdateWorkspaceType;
    config?: ApiLibraryConfig;
  }) {
    return super.apiFetch<Workspace>({
      httpMethod: 'patch',
      path: `${this.path}/me`,
      config,
      data,
      mockConfig: {
        isArray: false,
        schema: this.schema!,
      },
      onSuccess: async () => {
        await appQueryClient.invalidateQueries({
          queryKey: [this.serviceName, 'getMe'],
        });
      },
    });
  }

  /**
   * @description Returns the list of workspaces of the user.
   */
  getList(args?: { config?: ApiLibraryConfig }) {
    return super._getList<Workspace[]>({
      config: {
        ...args?.config,
        params: {
          expansion: ['logoUrl'],
          ...args?.config?.params,
        },
      },
    });
  }

  /**
   * @description Retrieves a workspace by its ID.
   */
  getById({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super._getById<Workspace>({ id, config });
  }

  /**
   * @description Creates a new workspace and sets it as the active workspace.
   */
  create({
    data,
    config,
  }: {
    data: CreateWorkspaceType;
    config?: ApiLibraryConfig;
  }) {
    return super._create<Workspace>({ data, config });
  }

  /**
   * @description Deletes a workspace. This action is irreversible.
   */
  delete({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super._delete<boolean>({ id, config });
  }

  getPresignedPostUrlForLogo({
    id,
    fileName,
    config,
  }: {
    id: string;
    fileName: string;
    config?: ApiLibraryConfig;
  }) {
    return super.apiFetch<{
      presignedPostData: { url: string; fields: Record<string, string> };
      pathUrl: string;
    }>({
      httpMethod: 'post',
      path: `${this.path}/${id}/logo-post-url`,
      data: { fileName },
      config,
      mockConfig: {
        isArray: false,
        schema: null,
      },
    });
  }

  setActiveWorkspace({ workspaceId }: { workspaceId: string }) {
    return super.apiFetch<Workspace>({
      httpMethod: 'put',
      path: `${this.path}/${workspaceId}`,
      mockConfig: {
        schema: null,
      },
      onSuccess: async () => {
        await appQueryClient.invalidateQueries({
          queryKey: [this.serviceName, 'getMe'],
        });
      },
    });
  }

  leaveWorkspace({ workspaceId }: { workspaceId: string }) {
    return super.apiFetch<Workspace>({
      httpMethod: 'post',
      path: `${this.path}/${workspaceId}/leave`,
      mockConfig: {
        schema: null,
      },
      onSuccess: async () => {
        //Will just logout the user so no need to invalidate queries.
      },
    });
  }

  removeUserFromWorkspace({ workspaceUserId }: { workspaceUserId: string }) {
    return super.apiFetch<Workspace>({
      httpMethod: 'post',
      path: `${this.path}/remove`,
      mockConfig: {
        schema: null,
      },
      data: { workspaceUserId },
      onSuccess: async () => {
        //TODO: You shouldn't be able to remove yourself. If you want to remove yourself, call leaveWorkspace istead.
      },
    });
  }

  validateWorkspaceBetaKey<
    T = {
      betaKey: string;
    },
  >({ betaKey }: { betaKey: string }) {
    return this.apiFetch<T>({
      path: `${this.path}/validate-workspace-beta-key`,
      httpMethod: 'post',
      data: {
        betaKey,
      },
      mockConfig: {
        schema: null,
      },
    });
  }

  getPresignedPostUrlForTempFile({
    fileName,
    config,
  }: {
    fileName: string;
    config?: ApiLibraryConfig;
  }) {
    return super.apiFetch<{
      presignedPostData: { url: string; fields: Record<string, string> };
      pathUrl: string;
    }>({
      httpMethod: 'post',
      path: `${this.path}/upload-temp-file-url`,
      data: { fileName },
      config,
      mockConfig: {
        isArray: false,
        schema: null,
      },
    });
  }
}

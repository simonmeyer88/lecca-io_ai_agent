import {
  UpdateWorkspaceUserType,
  WorkspaceUser,
  workspaceUserSchema,
} from '@/models/workspace-user-model';

import { ApiLibrary, ApiLibraryConfig, appQueryClient } from '../api-library';
import { ApiLibraryHelper } from '../api-library-helpers';

export default class WorkspaceUsersService extends ApiLibraryHelper {
  protected schema = workspaceUserSchema;
  protected path = '/workspace-users';
  protected serviceName = 'workspace-users' as keyof ApiLibrary;

  getList(args?: { config?: ApiLibraryConfig }) {
    return super._getList<WorkspaceUser[]>({
      config: {
        ...args?.config,
        params: {
          expansion: ['profileImageUrl', 'roles', 'user'],
          ...args?.config?.params,
        },
      },
    });
  }

  /**
   * @description Returns the user's details. Will mainly be used for the user's profile page.
   */
  getMe(args?: { config?: ApiLibraryConfig }) {
    return super._getMe<WorkspaceUser>({
      config: args?.config,
    });
  }

  /**
   * @description Updates the user's details.
   */
  updateMe({
    data,
    config,
  }: {
    data: UpdateWorkspaceUserType;
    config?: ApiLibraryConfig;
  }) {
    return super.apiFetch<WorkspaceUser>({
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
   * @description This would be used to leave a workspace.
   */
  deleteMe({ config }: { config?: ApiLibraryConfig }) {
    return super.apiFetch<WorkspaceUser>({
      httpMethod: 'delete',
      path: `${this.path}/me`,
      config,
      mockConfig: {
        schema: null,
      },
    });
  }

  /**
   * @description Returns a user by id.
   */
  getById({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super._getById<WorkspaceUser>({
      id,
      config: {
        ...config,
        params: {
          expansion: ['profileImageUrl', 'roles'],
          ...config?.params,
        },
      },
    });
  }

  /**
   * @description Updates a user by id.
   */
  update({
    id,
    data,
    config,
  }: {
    id: string;
    data: UpdateWorkspaceUserType;
    config?: ApiLibraryConfig;
  }) {
    return super._update<WorkspaceUser>({ id, data, config });
  }

  getPresignedPostUrlForProfileImage({
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
      path: `${this.path}/${id}/profile-image-post-url`,
      data: { fileName },
      config,
      mockConfig: {
        isArray: false,
        schema: null,
      },
    });
  }

  delete({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super._delete<boolean>({ id, config });
  }
}

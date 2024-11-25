import {
  CreateWorkspaceInvitationType,
  UpdateWorkspaceInvitationType,
  WorkspaceInvitation,
  workspaceInvitationSchema,
} from '@/models/workspace-invitation-model';

import { ApiLibrary, ApiLibraryConfig, appQueryClient } from '../api-library';
import { ApiLibraryHelper } from '../api-library-helpers';

export default class WorkspaceInvitationsService extends ApiLibraryHelper {
  protected schema = workspaceInvitationSchema;
  protected path = '/workspace-invitations';
  protected serviceName = 'workspaceInvitations' as keyof ApiLibrary;

  /**
   * @description Returns all workspace invitations for the given user's email address
   */
  async getMe(args?: { config?: ApiLibraryConfig }) {
    const response = await super.apiFetch<WorkspaceInvitation[]>({
      httpMethod: 'get',
      path: `${this.path}/me`,
      config: args?.config,
      mockConfig: {
        schema: this.schema,
        isArray: true,
      },
    });

    return response;
  }

  /**
   * @description Returns the list of workspace invitations
   */
  getList(args?: { config?: ApiLibraryConfig }) {
    return super._getList<WorkspaceInvitation[]>({
      config: args?.config,
    });
  }

  /**
   * @description Retrieves a workspace invitation by its ID.
   */
  getById({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super._getById<WorkspaceInvitation>({ id, config });
  }

  /**
   * @description Creates a new workspace invitation.
   */
  create({
    data,
    config,
  }: {
    data: CreateWorkspaceInvitationType;
    config?: ApiLibraryConfig;
  }) {
    return super._create<WorkspaceInvitation>({ data, config });
  }

  /**
   * @description Updates the workspace invitations's details.
   */
  update({
    id,
    data,
    config,
  }: {
    id: string;
    data: UpdateWorkspaceInvitationType;
    config?: ApiLibraryConfig;
  }) {
    return super._update<WorkspaceInvitation>({ id, data, config });
  }

  /**
   * @description Deletes a workspace.
   */
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
                queryKey: [this.serviceName, 'getList'],
              }),
              appQueryClient.invalidateQueries({
                queryKey: [this.serviceName, 'getMe'],
              }),
            ]);
          },
        },
      },
    });
  }

  acceptInvitation({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super.apiFetch<boolean>({
      path: `${this.path}/${id}/accept`,
      httpMethod: 'post',
      config,
      mockConfig: {
        schema: null,
      },
      onSuccess: async () => {
        await Promise.all([
          appQueryClient.invalidateQueries({
            queryKey: ['workspaces', 'getList'],
          }),
          appQueryClient.invalidateQueries({
            queryKey: [this.serviceName, 'getList'],
          }),
          appQueryClient.invalidateQueries({
            queryKey: [this.serviceName, 'getMe'],
          }),
        ]);
      },
    });
  }

  declineInvitation({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super.apiFetch<boolean>({
      path: `${this.path}/${id}/decline`,
      httpMethod: 'post',
      config,
      mockConfig: {
        schema: null,
      },
      onSuccess: async () => {
        await Promise.all([
          appQueryClient.invalidateQueries({
            queryKey: [this.serviceName, 'getList'],
          }),
          appQueryClient.invalidateQueries({
            queryKey: [this.serviceName, 'getMe'],
          }),
        ]);
      },
    });
  }
}

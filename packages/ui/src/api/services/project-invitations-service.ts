import {
  CreateProjectInvitationType,
  ProjectInvitation,
  projectInvitationSchema,
} from '../../models/project/project-invitation-model';
import { ApiLibrary, ApiLibraryConfig, appQueryClient } from '../api-library';
import { ApiLibraryHelper } from '../api-library-helpers';

export default class ProjectInvitationsService extends ApiLibraryHelper {
  protected schema = projectInvitationSchema;
  protected path = '/project-invitations';
  protected serviceName = 'projectInvitations' as keyof ApiLibrary;

  /**
   * @description Returns the project invitation for the current workspace user
   */
  async getMe(args?: { config?: ApiLibraryConfig }) {
    const response = await super.apiFetch<ProjectInvitation[]>({
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

  getProjectInvitationsByProjectId({
    projectId,
    config,
  }: {
    projectId: string;
    config?: ApiLibraryConfig;
  }) {
    return super.apiFetch<ProjectInvitation[]>({
      httpMethod: 'get',
      mockConfig: {
        schema: projectInvitationSchema,
        isArray: true,
      },
      path: `/projects/${projectId}/project-invitations`,
      config,
    });
  }

  /**
   * @description Retrieves a project invitation by its ID.
   */
  getById({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super._getById<ProjectInvitation>({ id, config });
  }

  /**
   * @description Creates a new project invitation.
   */
  create({
    data,
    projectId,
    config,
  }: {
    data: CreateProjectInvitationType;
    projectId: string;
    config?: ApiLibraryConfig;
  }) {
    return super.apiFetch<ProjectInvitation>({
      httpMethod: 'post',
      mockConfig: {
        schema: projectInvitationSchema,
      },
      path: `/projects/${projectId}/project-invitations`,
      data,
      config,
      onSuccess: async (invitation) => {
        await Promise.all([
          appQueryClient.invalidateQueries({
            queryKey: [
              this.serviceName,
              'getProjectInvitationsByProjectId',
              ...super.getQueryKeyFromArgIds({
                projectId: invitation.project.id,
              }),
            ],
          }),
          appQueryClient.invalidateQueries({
            queryKey: [this.serviceName, 'getMe'],
          }),
        ]);
      },
    });
  }

  /**
   * @description Deletes an invitation.
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
                queryKey: [
                  this.serviceName,
                  'getProjectInvitationsByProjectId',
                ],
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

  /**
   * @description Accepts an invitation.
   */
  accept({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super.apiFetch<boolean>({
      httpMethod: 'post',
      mockConfig: {
        schema: null,
      },
      path: `${this.path}/${id}/accept`,
      onSuccess: async () => {
        await Promise.all([
          appQueryClient.invalidateQueries({
            queryKey: [this.serviceName, 'getProjectInvitationsByProjectId'],
          }),
          appQueryClient.invalidateQueries({
            queryKey: [this.serviceName, 'getMe'],
          }),
          appQueryClient.invalidateQueries({
            queryKey: ['projects'],
          }),
        ]);
      },
      config,
    });
  }
}

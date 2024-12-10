import {
  UpdateWorkspacePreferencesType,
  WorkspacePreferences,
  workspacePreferencesSchema,
} from '../../models/workspace-preferences-model';
import { ApiLibrary, ApiLibraryConfig, appQueryClient } from '../api-library';
import { ApiLibraryHelper } from '../api-library-helpers';

export default class WorkspacePreferencesService extends ApiLibraryHelper {
  protected schema = workspacePreferencesSchema;
  protected path = '/workspace-preferences';
  protected serviceName = 'workspace-preferences' as keyof ApiLibrary;

  async getMe(args?: { config?: ApiLibraryConfig }) {
    const response = await super._getMe<WorkspacePreferences>({
      config: args?.config,
    });

    return response;
  }

  updateMe({
    data,
    config,
  }: {
    data: UpdateWorkspacePreferencesType;
    config?: ApiLibraryConfig;
  }) {
    return super.apiFetch<WorkspacePreferences>({
      httpMethod: 'patch',
      path: `${this.path}/me`,
      config,
      data,
      mockConfig: {
        schema: this.schema!,
      },
      onSuccess: async () => {
        await Promise.all([
          appQueryClient.invalidateQueries({
            queryKey: [this.serviceName, 'getMe'],
          }),
          // This is because if the workspace preferences for disabled features is updated,
          // we want to refetch the enabled features as well since they might've changed.
          // This would work, however we're not using react query for this call, so it won't update.
          //When the user updates their disabled features, we just toast "Refresh the page to see changes."
          appQueryClient.invalidateQueries({
            queryKey: ['discovery', 'getEnabledWorkspaceFeatures'],
          }),
        ]);
      },
    });
  }
}

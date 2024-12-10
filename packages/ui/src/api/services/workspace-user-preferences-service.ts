import {
  UpdateWorkspaceUserPreferencesType,
  WorkspaceUserPreferences,
  workspaceUserPreferencesSchema,
} from '../../models/workspace-user-preferences-model';
import { ApiLibrary, ApiLibraryConfig, appQueryClient } from '../api-library';
import { ApiLibraryHelper } from '../api-library-helpers';

export default class WorkspaceUserPreferencesService extends ApiLibraryHelper {
  protected schema = workspaceUserPreferencesSchema;
  protected path = '/workspace-user-preferences';
  protected serviceName = 'workspace-user-preferences' as keyof ApiLibrary;

  async getMe(args?: { config?: ApiLibraryConfig }) {
    const response = await super._getMe<WorkspaceUserPreferences>({
      config: args?.config,
    });

    /**
     * Since user preferences affect the theme and other visual aspects of the app,
     * we want to cache the preferences in the data to prevent flickering after the preferences are loaded.
     */

    if (response.data) {
      window.localStorage.setItem(
        'userPreferences',
        JSON.stringify(response.data),
      );
    }

    return response;
  }

  async updateMe({
    data,
    config,
  }: {
    data: UpdateWorkspaceUserPreferencesType;
    config?: ApiLibraryConfig;
  }) {
    const response = await super.apiFetch<WorkspaceUserPreferences>({
      httpMethod: 'patch',
      path: `${this.path}/me`,
      config,
      data,
      mockConfig: {
        schema: this.schema!,
      },
      onSuccess: async () => {
        await appQueryClient.invalidateQueries({
          queryKey: [this.serviceName, 'getMe'],
        });
      },
    });

    /**
     * Since workspace user preferences affect the theme and other visual aspects of the app,
     * we want to cache the preferences in the data to prevent flickering after the preferences are loaded.
     */

    if (response.data) {
      window.localStorage.setItem(
        'userPreferences',
        JSON.stringify(response.data),
      );
    }

    return response;
  }
}

import { UpdateUserType, User, userSchema } from '../../models/user-model';
import { ApiLibrary, ApiLibraryConfig, appQueryClient } from '../api-library';
import { ApiLibraryHelper } from '../api-library-helpers';

export default class UsersService extends ApiLibraryHelper {
  protected schema = userSchema;
  protected path = '/users';
  protected serviceName = 'users' as keyof ApiLibrary;

  getList(args?: { config?: ApiLibraryConfig }) {
    return super._getList<User[]>({ config: args?.config });
  }

  /**
   * @description Returns the user's details. Will mainly be used for the user's profile page.
   */
  getMe(args?: { config?: ApiLibraryConfig }) {
    return super._getMe<User>({
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
    data: UpdateUserType;
    config?: ApiLibraryConfig;
  }) {
    return super.apiFetch<User>({
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
   * @description Updates the user's details.
   */
  deleteMe({ config }: { config?: ApiLibraryConfig }) {
    return super.apiFetch<User>({
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
    return super._getById<User>({ id, config });
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
    data: UpdateUserType;
    config?: ApiLibraryConfig;
  }) {
    return super._update<User>({ id, data, config });
  }

  delete({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super._delete<User>({ id, config });
  }
}

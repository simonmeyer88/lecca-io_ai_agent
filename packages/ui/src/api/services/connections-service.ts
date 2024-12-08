import {
  Connection,
  CreateConnectionType,
  UpdateConnectionType,
  connectionSchema,
} from '@/models/connections-model';

import { ApiLibrary, ApiLibraryConfig } from '../api-library';
import { ApiLibraryHelper } from '../api-library-helpers';

export default class ConnectionsService extends ApiLibraryHelper {
  protected schema = connectionSchema;
  protected path = '/connections';
  protected serviceName = 'connections' as keyof ApiLibrary;

  getList(args?: { config?: ApiLibraryConfig }) {
    return super._getList<Connection[]>({
      config: {
        ...args?.config,
        params: {
          expansion: [
            'description',
            'createdAt',
            'updatedAt',
            'workflowApp',
            'connectionId',
            'workflowAppId',
            'project',
          ],
          /**
           * Maintainers can see all connections in the workspace including all project connections
           * Non-maintainers can only see connections in the workspace and projects they belong to.
           */
          includeType: ['all'],
          ...args?.config?.params,
        },
      },
    });
  }

  getById({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super._getById<Connection>({
      id,
      config: {
        ...config,
        params: {
          expansion: [
            'description',
            'createdAt',
            'updatedAt',
            'workflowApp',
            'connectionId',
            'workflowAppId',
            'project',
          ],
          ...config?.params,
        },
      },
    });
  }

  create({
    data,
    config,
  }: {
    data: CreateConnectionType;
    config?: ApiLibraryConfig;
  }) {
    return super._create<Connection>({
      data,
      config,
    });
  }

  update({
    id,
    data,
    config,
  }: {
    id: string;
    data: UpdateConnectionType;
    config?: ApiLibraryConfig;
  }) {
    return super._update<Connection>({
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

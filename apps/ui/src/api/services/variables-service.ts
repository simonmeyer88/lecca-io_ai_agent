import {
  CreateVariableType,
  UpdateVariableType,
  Variable,
  variableSchema,
} from '@/models/variable-model';

import { ApiLibrary, ApiLibraryConfig } from '../api-library';
import { ApiLibraryHelper } from '../api-library-helpers';

export default class VariablesService extends ApiLibraryHelper {
  protected schema = variableSchema;
  protected path = '/variables';
  protected serviceName = 'variables' as keyof ApiLibrary;

  create({
    data,
    config,
  }: {
    data: CreateVariableType;
    config?: ApiLibraryConfig;
  }) {
    return super._create<Variable>({
      data,
      config,
    });
  }

  getList(args?: { config?: ApiLibraryConfig }) {
    return super._getList<Variable[]>({
      config: {
        ...args?.config,
        params: {
          expansion: [
            'value',
            'createdAt',
            'updatedAt',
            'project',
            'description',
          ],
          includeType: ['all'],
          ...args?.config?.params,
        },
      },
    });
  }

  getById({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super._getById<Variable>({
      id,
      config: {
        ...config,
        params: {
          expansion: [
            'value',
            'createdAt',
            'updatedAt',
            'project',
            'description',
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
    data: UpdateVariableType;
    config?: ApiLibraryConfig;
  }) {
    return super._update<Variable>({
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

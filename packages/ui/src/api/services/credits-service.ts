import { Credit, creditSchema } from '@/models/credits-model';

import { ApiLibrary, ApiLibraryConfig } from '../api-library';
import { ApiLibraryHelper } from '../api-library-helpers';

export default class CreditsService extends ApiLibraryHelper {
  protected schema = creditSchema;
  protected path = '/credits';
  protected serviceName = 'credits' as keyof ApiLibrary;

  getList(args?: { config?: ApiLibraryConfig }) {
    return super._getList<Credit[]>({
      config: {
        ...args?.config,
        params: {
          expansion: [
            'createdAt',
            'creditsUsed',
            'project',
            'execution',
            'task',
            'knowledge',
          ],
          ...args?.config?.params,
        },
      },
    });
  }

  getById({ id, config }: { id: string; config?: ApiLibraryConfig }) {
    return super._getById<Credit>({
      id,
      config: {
        ...config,
        params: {
          expansion: [
            'createdAt',
            'updatedAt',
            'creditsUsed',
            'details',
            'project',
            'workflow',
            'agent',
            'execution',
            'task',
            'knowledge',
          ],
          ...config?.params,
        },
      },
    });
  }
}

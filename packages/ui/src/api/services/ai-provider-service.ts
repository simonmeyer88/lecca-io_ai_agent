import {
  AiLanguageModelData,
  AiProvider,
  AiProviders,
} from '../../models/ai-provider-model';
import { ApiLibrary, ApiLibraryConfig } from '../api-library';
import { ApiLibraryHelper } from '../api-library-helpers';

export default class AiProvidersService extends ApiLibraryHelper {
  protected schema = null;
  protected path = '/ai';
  protected serviceName = 'aiProviders' as keyof ApiLibrary;

  getProviders(args?: { config?: ApiLibraryConfig }) {
    return super.apiFetch<AiProviders>({
      httpMethod: 'get',
      mockConfig: {
        schema: null,
      },
      path: `${this.path}/providers`,
      config: args?.config,
    });
  }

  getProviderModels(args: {
    providerId: AiProvider;
    connectionId: string;
    config?: ApiLibraryConfig;
  }) {
    return super.apiFetch<Record<string, AiLanguageModelData>>({
      httpMethod: 'get',
      mockConfig: {
        schema: null,
      },
      path: `${this.path}/providers/${args.providerId}/language-models?connectionId=${args.connectionId || 'credits'}`,
      config: args?.config,
    });
  }
}

import { Features, featuresSchema } from '../../models/discovery-model';
import { ApiLibrary } from '../api-library';
import { ApiLibraryHelper } from '../api-library-helpers';

export default class DiscoveryService extends ApiLibraryHelper {
  protected schema = null;
  protected path = '/discovery';
  protected serviceName = 'discovery' as keyof ApiLibrary;

  getEnabledWorkspaceFeatures() {
    return super.apiFetch<Features>({
      httpMethod: 'get',
      path: `${this.path}/enabled-features`,
      mockConfig: {
        schema: null,
        mockData: featuresSchema.transform((data) => {
          //Iterate over data object and set all values to true for mocking.
          for (const key in data) {
            (data as any)[key] = true;
          }
        }),
      },
    });
  }
}

import {
  BillingProduct,
  billingProductSchema,
} from '../../models/billing-model';
import { ApiLibrary, ApiLibraryConfig } from '../api-library';
import { ApiLibraryHelper } from '../api-library-helpers';

export default class BillingService extends ApiLibraryHelper {
  protected schema = null;
  protected path = '/billing';
  protected serviceName = 'billing' as keyof ApiLibrary;

  getProducts(args: { config?: ApiLibraryConfig }) {
    return super.apiFetch<BillingProduct[]>({
      httpMethod: 'get',
      mockConfig: { schema: billingProductSchema },
      path: `${this.path}/products`,
      config: args.config,
    });
  }

  createCheckoutSession(args: { priceId: string; config?: ApiLibraryConfig }) {
    return super.apiFetch<{ url: string }>({
      httpMethod: 'post',
      mockConfig: { schema: null, doNotMock: true },
      path: `${this.path}/checkout-session`,
      config: args.config,
      data: { priceId: args.priceId },
    });
  }

  getCustomerPortal(args: { config?: ApiLibraryConfig }) {
    return super.apiFetch<{ url: string }>({
      httpMethod: 'get',
      mockConfig: { schema: null, doNotMock: true },
      path: `${this.path}/customer-portal`,
      config: args.config,
    });
  }
}

import { useQuery } from '@tanstack/react-query';

import { api } from './api-library';

/**
 * A dynamic hook to call any method from the API library services.
 *
 * @param {string} service - The name of the service in the API library (e.g., 'locations', 'users').
 * @param {string} method - The method name to call on the service (e.g., 'getList', 'getById').
 * @param apiLibraryArgs - Arguments like `id` or `data` and an optional config to pass to the API library method.
 * @param reactQueryArgs - Optional arguments to pass to the react query hook
 */
export default function useApiQuery<
  Service extends keyof typeof api,
  Method extends keyof (typeof api)[Service],
>({
  service,
  method,
  apiLibraryArgs,
  reactQueryArgs,
}: {
  service: Service;
  method: Method;
  apiLibraryArgs: (typeof api)[Service][Method] extends Callable
    ? Parameters<(typeof api)[Service][Method]>[0] //0 because every method has one argument object that holds all the parameters
    : never;
  reactQueryArgs?: any;
}) {
  const queryKey: any[] = [service, method];

  //This is very fragile and could lead to bugs, but I can't think of a differen solution at the moment.
  //It's fragile, because it relies on the order of the properties in the apiLibraryArgs. If the order changes, this will break invalidating caches for that call.
  const idsForQueryKey: any[] = [];
  Object.keys(apiLibraryArgs).forEach((key) => {
    if (key.endsWith('Id') || key === 'id') {
      idsForQueryKey.push(apiLibraryArgs[key]);
    }
  });

  //Sorting the ids so that when we invalidate the cache, the ids are in the same order
  //This is because we can't rely on the argument order that is passed.
  idsForQueryKey.sort();
  queryKey.push(...idsForQueryKey);

  //There may be similar calls with different configs, so we need to include the config in the query key
  //This causes issues because setQueryData expects the exact key, and our delete onSuccess are not working. Commenting out for now.
  if (apiLibraryArgs.config) {
    queryKey.push(apiLibraryArgs.config);
  }

  const queryFn = async () => {
    const response = await (api[service][method] as any)({
      ...apiLibraryArgs,
    });

    if (response.data) {
      return response.data;
    } else {
      throw new Error(response.error);
    }
  };

  return useQuery<MethodResponseType<Service, Method>['data']>({
    ...reactQueryArgs,
    queryKey,
    queryFn,
  });
}

type MethodResponseType<
  Service extends keyof typeof api,
  Method extends keyof (typeof api)[Service],
> = (typeof api)[Service][Method] extends Callable
  ? UnwrapPromise<ReturnType<(typeof api)[Service][Method]>>
  : never;

// (typeof api)[Service][Method] extends () => Promise<infer R>
//   ? R
//   : string;

type Callable = (...args: any[]) => any;

//React query returns a promise, so we need to unwrap the promise to get the actual type at the time "data" is available
type UnwrapPromise<T> = T extends Promise<infer U> ? U : T;

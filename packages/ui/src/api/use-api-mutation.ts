import { NoInfer, useMutation } from '@tanstack/react-query';

import { useToast } from '../hooks/useToast';

import { api, appQueryClient } from './api-library';

/**
 * A dynamic hook to call any method from the API library services.
 *
 * @param {string} service - The name of the service in the API library (e.g., 'locations', 'users').
 * @param {string} method - The method name to call on the service (e.g., 'getList', 'getById').
 * @param apiLibraryArgs - Arguments like `id` or `data` and an optional config to pass to the API library method.
 * @param reactQueryArgs - Optional arguments to pass to the react query hook
 */
export default function useApiMutation<
  Service extends keyof typeof api,
  Method extends keyof (typeof api)[Service],
  ApiLibraryArgs extends (typeof api)[Service][Method] extends Callable
    ? Partial<Parameters<(typeof api)[Service][Method]>[0]> //0 because every method has one argument object that holds all the parameters
    : never,
>({
  service,
  method,
  apiLibraryArgs,
  reactQueryArgs,
}: {
  service: Service;
  method: Method;
  /**
   * Since at the time of creating this hook, you don't have the id, data, ids, or other params,
   * you can pass empty objects here. They will merge with the args you provide when you call mutation.mutate or mutation.asyncMutate
   */
  apiLibraryArgs?: NoInfer<ApiLibraryArgs>;
  reactQueryArgs?: any;
}) {
  const { toast } = useToast();

  /**
   * Mutations keys used like queryKeys. This is mostly for retries, debugging, and complex workflows.
   * In scenarios where mutations need to be managed in a complex workflow or state machine, especially when their status affects UI components differently, using a mutationKey can add clarity and control.
   * In our case, this will be useful when manually running worklows. However, for most cases, you can ignore this.
   */
  const mutationKey = [service, method];

  const mutationFn = async (data: any) => {
    Object.assign(data, apiLibraryArgs ?? {});

    const response = await (api[service][method] as any)({
      ...data,
    });

    if (response.data) {
      return response.data;
    } else {
      throw new Error(response.error);
    }
  };

  return useMutation<
    Required<MethodResponseType<Service, Method>>['data'],
    Error,
    ApiLibraryArgs
  >({
    ...reactQueryArgs,
    mutationKey,
    mutationFn,
    onMutate: (data) => {
      if ((api[service] as any)['getList'] as any) {
        //Cancel any getList calls for this service
        appQueryClient.cancelQueries({ queryKey: [service, 'getList'] });
      }

      if ((data as any)?.id) {
        //Cancel any getById calls for this service
        appQueryClient.cancelQueries({
          queryKey: [service, 'getById', (data as any).id],
        });
      }
    },
    onError: (error) => {
      if (error.message) {
        toast({
          title: error.message,
          variant: 'destructive',
        });
      }
    },
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

import { AxiosRequestConfig, AxiosResponse, Method } from 'axios';

export type InjectedServices = {
  http: {
    request: (args: HttpRequestArgs) => Promise<AxiosResponse<any, any>>;
  };
};

type HttpRequestArgs = {
  method: Extract<
    Method,
    | 'GET'
    | 'DELETE'
    | 'POST'
    | 'PUT'
    | 'PATCH'
    | 'get'
    | 'delete'
    | 'post'
    | 'put'
    | 'patch'
  >;
  url: AxiosRequestConfig['url'];
  headers?: AxiosRequestConfig['headers'];
  params?: AxiosRequestConfig['params'];
  data?: AxiosRequestConfig['data'];
  /**
   * For logging purposes
   */
  workspaceId: string | undefined;
};

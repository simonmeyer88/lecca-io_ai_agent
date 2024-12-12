import type { PrismaClient } from '@prisma/client';
import { AxiosRequestConfig, AxiosResponse, Method } from 'axios';

export type InjectedServices = {
  http: {
    request: (args: HttpRequestArgs) => Promise<AxiosResponse<any, any>>;
  };
  prisma: PrismaClient;
  fileHandler: {
    downloadFile<T extends boolean>({
      url,
      maxSize,
      dataType,
    }: {
      url: string;
      maxSize?: number;
      dataType: 'blob' | 'buffer';
    }): Promise<
      T extends true
        ? { data: Buffer; contentType: string; filename: string }
        : {
            data: Blob;
            contentType: string;
            filename: string;
          }
    >;
    uploadMultiPartFormData(args: {
      url: string;
      blob: Blob;
      filename: string;
      headers: Record<string, string>;
    }): Promise<any>;
  };
  s3: {
    getSignedRetrievalUrl: (
      filePath: string,
      args: {
        expiresInMinutes: number;
      },
    ) => Promise<string>;
    uploadBufferFile: (args: {
      buffer: Buffer | ArrayBuffer;
      filePath: string;
      fileName: string;
    }) => Promise<string>;
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

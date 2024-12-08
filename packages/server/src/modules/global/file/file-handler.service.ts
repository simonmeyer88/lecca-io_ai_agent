import { HttpService } from '@nestjs/axios';
import { Injectable } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable()
export class FileHandlerService {
  constructor(private readonly http: HttpService) {}

  async downloadFile<T extends boolean>({
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
  > {
    const response = await firstValueFrom(
      this.http.get(url, { responseType: 'arraybuffer' }).pipe(
        catchError((error) => {
          throw new Error(`Failed to download file: ${error.message}`);
        }),
      ),
    );

    const fileSize = parseInt(response.headers['content-length'], 10);
    if (maxSize && !isNaN(fileSize) && fileSize > maxSize) {
      throw new Error(`File exceeds maximum size of ${maxSize} bytes`);
    }

    const contentType =
      response.headers['content-type'] || 'application/octet-stream';

    // Extract filename from Content-Disposition or fallback to a default name
    let filename = 'attachment';
    const contentDisposition = response.headers['content-disposition'];
    if (contentDisposition && contentDisposition.includes('filename=')) {
      filename = contentDisposition
        .split('filename=')[1]
        .split(';')[0]
        .replace(/['"]/g, '');
    } else {
      // Fallback: Extract filename from URL if no content disposition header
      const parsedUrl = new URL(url);
      const urlParts = parsedUrl.pathname.split('/');
      filename = urlParts[urlParts.length - 1] || `attachment-${Date.now()}`;
    }

    if (dataType === 'buffer') {
      return {
        data: response.data,
        contentType,
        filename,
      };
    } else {
      const blob = new Blob([response.data], { type: contentType });

      return {
        data: blob,
        contentType,
        filename,
      } as any;
    }
  }

  async uploadMultiPartFormData({
    url,
    blob,
    filename = 'uploaded_file',
    headers,
  }: {
    url: string;
    blob: Blob;
    filename: string;
    headers: Record<string, string>;
  }): Promise<any> {
    const formData = new FormData();
    formData.append('file', blob, filename);

    const response = await firstValueFrom(
      this.http
        .post(url, formData, {
          headers: {
            ...headers,
            'Content-Type': 'multipart/form-data',
          },
        })
        .pipe(
          catchError((error) => {
            throw new Error(`File upload failed: ${error.message}`);
          }),
        ),
    );

    return response.data;
  }
}

import {
  DeleteObjectCommand,
  DeleteObjectsCommand,
  GetObjectCommand,
  ListObjectsV2Command,
  PutObjectCommand,
  S3Client,
} from '@aws-sdk/client-s3';
import { createPresignedPost } from '@aws-sdk/s3-presigned-post';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { Injectable } from '@nestjs/common';
import { Readable } from 'stream';

import { ServerConfig } from '../../../config/server.config';

const env_prefix =
  ServerConfig.ENVIRONMENT === 'production' ? 'production/' : 'development/';

function createPath(...parts: string[]): string {
  if (parts.length === 0) return '/';
  let fullPath = parts[0];
  for (let i = 1; i < parts.length; i++) {
    if (!fullPath.endsWith('/')) fullPath += '/';
    fullPath += parts[i];
  }
  return fullPath;
}

@Injectable()
export class S3ManagerService {
  constructor() {
    const S3_REGION = ServerConfig.S3_REGION;
    const S3_ACCESS_KEY_ID = ServerConfig.S3_ACCESS_KEY_ID;
    const S3_SECRET_ACCESS_KEY = ServerConfig.S3_SECRET_ACCESS_KEY;
    const S3_BUCKET_ID = ServerConfig.S3_BUCKET_ID;

    if (
      !S3_REGION ||
      !S3_ACCESS_KEY_ID ||
      !S3_SECRET_ACCESS_KEY ||
      !S3_BUCKET_ID
    ) {
      //Cannot use S3 without the required environment variables
    } else {
      this.#s3Client = new S3Client({
        region: ServerConfig.S3_REGION,
        credentials: {
          accessKeyId: ServerConfig.S3_ACCESS_KEY_ID,
          secretAccessKey: ServerConfig.S3_SECRET_ACCESS_KEY,
        },
      });
    }
  }

  #s3Client: S3Client;

  #AWS_S3_BUCKET_ID = ServerConfig.S3_BUCKET_ID;

  public async getPresignedPostUrl({
    filePath,
    fileName,
    options,
  }: {
    filePath: string;
    fileName: string;
    options?: {
      ContentType?: string | null;
      ExpirationMinutes?: number;
      publicRead?: boolean;
    };
  }) {
    const Conditions: any[] = [
      ['content-length-range', 0, 1024 * 1024 * 5], // 5 MB
    ];
    const Fields: Record<string, any> = {
      key: createPath(env_prefix, filePath),
    };

    if (options?.publicRead) {
      Fields['acl'] = 'public-read';
    }
    if (options?.ContentType) {
      Fields['Content-Type'] = options.ContentType;
    } else if (fileName) {
      Fields['Content-Type'] =
        getContentTypeFromFileName(fileName) ?? 'application/octet-stream';
    }

    const presignedPostData = await createPresignedPost(this.#s3Client, {
      Bucket: this.#AWS_S3_BUCKET_ID,
      Key: Fields.key,
      Conditions,
      Fields,
      Expires: 60 * (options?.ExpirationMinutes ?? 1),
    });

    return {
      presignedPostData,
      pathUrl: Fields.key,
    };
  }

  public async getSignedRetrievalUrl(
    filePath: string,
    options?: { expiresInMinutes?: number },
  ) {
    const command = new GetObjectCommand({
      Bucket: this.#AWS_S3_BUCKET_ID,
      Key: createPath(env_prefix, filePath),
    });
    return await getSignedUrl(this.#s3Client, command, {
      expiresIn: options?.expiresInMinutes ?? 60,
    });
  }

  public async deleteFile(filePath: string) {
    const command = new DeleteObjectCommand({
      Bucket: this.#AWS_S3_BUCKET_ID,
      Key: createPath(env_prefix, filePath),
    });
    await this.#s3Client.send(command);
    return true;
  }

  public async deletePath(path: string) {
    const listParams = {
      Bucket: this.#AWS_S3_BUCKET_ID,
      Prefix: createPath(env_prefix, path),
    };

    try {
      const listedObjects = await this.#s3Client.send(
        new ListObjectsV2Command(listParams),
      );

      if (listedObjects.Contents && listedObjects.Contents.length > 0) {
        const objectsToDelete = listedObjects.Contents.filter(
          (key) => key.Key,
        ).map((key) => ({ Key: key.Key }));

        const deleteParams = {
          Bucket: this.#AWS_S3_BUCKET_ID,
          Delete: {
            Objects: objectsToDelete,
          },
        };
        await this.#s3Client.send(new DeleteObjectsCommand(deleteParams));

        if (listedObjects.IsTruncated) {
          await this.deletePath(path);
        }
      }
    } catch (err) {
      console.error('Error deleting objects', err);
      throw err;
    }
  }

  public async uploadTextFile({
    textContent,
    filePath,
  }: {
    textContent: string;
    filePath: string;
  }) {
    const command = new PutObjectCommand({
      Bucket: this.#AWS_S3_BUCKET_ID,
      Key: createPath(env_prefix, filePath),
      Body: textContent,
    });
    await this.#s3Client.send(command);
    return true;
  }

  public async uploadBufferFile({
    buffer,
    filePath,
    fileName,
  }: {
    buffer: Buffer | ArrayBuffer;
    filePath: string;
    fileName: string;
  }) {
    const bufferToUpload = Buffer.isBuffer(buffer)
      ? buffer
      : Buffer.from(buffer as ArrayBuffer);
    const command = new PutObjectCommand({
      Bucket: this.#AWS_S3_BUCKET_ID,
      Key: createPath(env_prefix, filePath),
      Body: bufferToUpload,
      ContentType:
        getContentTypeFromFileName(fileName) ?? 'application/octet-stream',
    });
    await this.#s3Client.send(command);
    return this.getSignedRetrievalUrl(filePath);
  }

  public async readTextFile({ filePath }: { filePath: string }) {
    const command = new GetObjectCommand({
      Bucket: this.#AWS_S3_BUCKET_ID,
      Key: createPath(env_prefix, filePath),
    });
    const { Body } = await this.#s3Client.send(command);
    const readable = Body as Readable;
    return await this.streamToString(readable);
  }

  public async deleteTempFiles(folderPath: string) {
    const now = new Date();
    const cutoffTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);

    try {
      let continuationToken: string | undefined;
      do {
        const listParams = {
          Bucket: this.#AWS_S3_BUCKET_ID,
          Prefix: createPath(env_prefix, folderPath),
          ContinuationToken: continuationToken,
        };
        const listedObjects = await this.#s3Client.send(
          new ListObjectsV2Command(listParams),
        );

        const oldFiles = (listedObjects.Contents ?? []).filter(
          (file) => file.LastModified && file.LastModified < cutoffTime,
        );

        if (oldFiles.length > 0) {
          const oldFilesToDelete = oldFiles
            .filter((file) => file.Key)
            .map((file) => ({ Key: file.Key }));

          const deleteParams = {
            Bucket: this.#AWS_S3_BUCKET_ID,
            Delete: { Objects: oldFilesToDelete },
          };
          await this.#s3Client.send(new DeleteObjectsCommand(deleteParams));
        }

        continuationToken = listedObjects.IsTruncated
          ? listedObjects.NextContinuationToken
          : undefined;
      } while (continuationToken);
    } catch (error) {
      console.error('Error deleting old files:', error);
    }
  }

  private async streamToString(readable: Readable): Promise<string> {
    return new Promise((resolve, reject) => {
      const chunks: any[] = [];
      readable.on('data', (chunk) => chunks.push(chunk));
      readable.on('end', () =>
        resolve(Buffer.concat(chunks).toString('utf-8')),
      );
      readable.on('error', reject);
    });
  }
}

function getContentTypeFromFileName(fileName: string): string | null {
  const fileExtension = fileName.split('.').pop()?.toLowerCase();
  return fileExtension ? contentTypeMap[fileExtension] : null;
}

const contentTypeMap: { [key: string]: string } = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  bmp: 'image/bmp',
  webp: 'image/webp',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
  html: 'text/html',
  css: 'text/css',
  js: 'text/javascript',
  json: 'application/json',
  xml: 'application/xml',
  svg: 'image/svg+xml',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  mp4: 'video/mp4',
  mpeg: 'video/mpeg',
  avi: 'video/x-msvideo',
  zip: 'application/zip',
  gzip: 'application/x-gzip',
  tar: 'application/x-tar',
  bz2: 'application/x-bzip2',
  csv: 'text/csv',
  rss: 'application/rss+xml',
  atom: 'application/atom+xml',
};

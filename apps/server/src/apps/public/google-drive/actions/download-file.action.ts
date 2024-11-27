import * as path from 'path';
import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { GoogleDrive } from '../google-drive.app';

export class DownloadFile extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleDrive;
  id = 'google-drive_action_download-file';
  name = 'Download File';
  description =
    'Downloads a file from Google Drive as-is in its original format.';
  aiSchema = z.object({
    file: z.string().min(1).describe('The ID of the file to download'),
  });
  inputConfig: InputConfig[] = [
    {
      ...this.app.dynamicSelectDownloadableFile(),
      label: 'File to Download',
      description: '',
    },
    {
      id: 'markdown',
      label: '',
      description: '',
      inputType: 'markdown',
      markdown:
        'Downloading a file will generate a link to retrieve the file. This link will only be available for 24 hours.',
    },
    {
      id: 'markdown2',
      label: '',
      description: '',
      inputType: 'markdown',
      markdown:
        'Only files with binary content that can be downloaded are visible, such as PDF, images (JPEG/PNG), Word (DOCX), Excel (XLSX), and PowerPoint (PPTX). Use Export file action for other file types.',
    },
  ];

  async run({
    configValue,
    connection,
    workspaceId,
  }: RunActionArgs<ConfigValue>): Promise<Response> {
    const googleDrive = await this.app.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const fileToDownloadId = configValue['file'];

    // Fetch the file metadata to get the name and mimeType
    const fileMetadata = await googleDrive.files.get({
      fileId: fileToDownloadId,
      fields: 'name, mimeType', // Fetch name and MIME type
    });

    const fileName = fileMetadata.data.name;
    const mimeType = fileMetadata.data.mimeType;
    const fileExtension =
      path.extname(fileName) || mimeToExtensionMap[mimeType] || '';
    const baseFileName = path.basename(fileName, fileExtension); // Get the base name without extension

    // Download the file as-is
    const downloadedFile = await googleDrive.files.get(
      {
        fileId: fileToDownloadId,
        alt: 'media', // Get file content
      },
      { responseType: 'arraybuffer' }, // Use arraybuffer to download binary file
    );

    // Include the file extension in the path
    const filePath = `temp/workspaces/${workspaceId}/created-at/${Date.now()}/${baseFileName}${fileExtension}`;

    // Upload the downloaded file to S3
    await this.app.s3.uploadBufferFile({
      buffer: downloadedFile.data as Buffer,
      fileName: fileName + fileExtension, // Keep original name if needed
      filePath,
    });

    const url = await this.app.s3.getSignedRetrievalUrl(filePath, {
      expiresInMinutes: 1440,
    });

    return {
      fileUrl: url,
      fileType: mimeType,
      fileName, // Include the name of the file
      downloadTime: new Date().toISOString(),
    };
  }

  async mockRun(): Promise<Response> {
    return {
      fileUrl: 'https://example.com/mock-file-url',
      fileType: 'application/pdf',
      fileName: 'mock-file-name',
      downloadTime: new Date().toISOString(),
    };
  }
}

const mimeToExtensionMap: { [key: string]: string } = {
  'application/pdf': '.pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
    '.docx',
  'text/plain': '.txt',
  'text/html': '.html',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': '.xlsx',
  'text/csv': '.csv',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation':
    '.pptx',
  //... add other necessary mappings
};

type Response = {
  fileUrl: string;
  fileType: string;
  fileName: string;
  downloadTime: string;
};

type ConfigValue = z.infer<DownloadFile['aiSchema']>;

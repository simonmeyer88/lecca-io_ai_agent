import { createAction, createMarkdownField } from '@lecca-io/toolkit';
import * as path from 'path';
import { z } from 'zod';

import { shared } from '../shared/google-drive.shared';

export const downloadFile = createAction({
  id: 'google-drive_action_download-file',
  name: 'Download File',
  description:
    'Downloads a file from Google Drive as-is in its original format.',
  inputConfig: [
    shared.fields.dynamicSelectDownloadableFile,
    createMarkdownField({
      id: 'markdown',
      markdown:
        'Downloading a file will generate a link to retrieve the file. This link will only be available for 24 hours.',
    }),
    createMarkdownField({
      id: 'markdown2',
      markdown:
        'Only files with binary content that can be downloaded are visible, such as PDF, images (JPEG/PNG), Word (DOCX), Excel (XLSX), and PowerPoint (PPTX). Use Export file action for other file types.',
    }),
  ],
  aiSchema: z.object({
    file: z.string().describe('The ID of the file to download'),
  }),
  run: async ({ configValue, connection, workspaceId, s3 }) => {
    const googleDrive = shared.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const fileToDownloadId = configValue.file;

    const fileMetadata = await googleDrive.files.get({
      fileId: fileToDownloadId,
      fields: 'name, mimeType',
    });

    const fileName = fileMetadata.data.name;
    const mimeType = fileMetadata.data.mimeType;
    const fileExtension =
      path.extname(fileName) || mimeToExtensionMap[mimeType] || '';
    const baseFileName = path.basename(fileName, fileExtension);

    const downloadedFile = await googleDrive.files.get(
      {
        fileId: fileToDownloadId,
        alt: 'media',
      },
      { responseType: 'arraybuffer' },
    );

    const filePath = `temp/workspaces/${workspaceId}/created-at/${Date.now()}/${baseFileName}${fileExtension}`;

    await s3.uploadBufferFile({
      buffer: downloadedFile.data as Buffer,
      fileName: fileName + fileExtension,
      filePath,
    });

    const url = await s3.getSignedRetrievalUrl(filePath, {
      expiresInMinutes: 1440, //24 hours
    });

    return {
      fileUrl: url,
      fileType: mimeType,
      fileName,
      downloadTime: new Date().toISOString(),
    };
  },
  mockRun: async () => {
    return {
      fileUrl: 'https://example.com/mock-file-url',
      fileType: 'application/pdf',
      fileName: 'mock-file-name',
      downloadTime: new Date().toISOString(),
    };
  },
});

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
};

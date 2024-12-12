import {
  createAction,
  createDynamicSelectInputField,
  createMarkdownField,
} from '@lecca-io/toolkit';
import * as path from 'path';
import { z } from 'zod';

import { shared } from '../shared/google-drive.shared';

export const exportFile = createAction({
  id: 'google-drive_action_export-file',
  name: 'Export File',
  description:
    'Exports a file from Google Drive in the specified format based on the file type.',
  inputConfig: [
    {
      ...shared.fields.dynamicSelectExportableFile,
      label: 'File to Export',
      description: '',
    },
    createDynamicSelectInputField({
      id: 'format',
      label: 'Export Format',
      description: 'Select the format to export the file',
      loadOptions: {
        dependsOn: ['file'],
        forceRefresh: true,
      },
      required: {
        missingMessage: 'Export format is required',
        missingStatus: 'warning',
      },
      _getDynamicValues: async ({ connection, extraOptions }) => {
        const file = extraOptions['file'];
        if (!file) throw new Error('File ID is required');

        const googleDrive = shared.googleDrive({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        const fileMetadata = await googleDrive.files.get({
          fileId: file,
          fields: 'mimeType',
        });

        const mimeType = fileMetadata.data.mimeType;

        switch (mimeType) {
          case 'application/vnd.google-apps.document':
            return [
              { label: 'PDF', value: 'application/pdf' },
              {
                label: 'Word (DOCX)',
                value:
                  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
              },
              { label: 'Plain Text (TXT)', value: 'text/plain' },
              { label: 'HTML', value: 'text/html' },
            ];
          case 'application/vnd.google-apps.spreadsheet':
            return [
              {
                label: 'Excel (XLSX)',
                value:
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              },
              { label: 'CSV', value: 'text/csv' },
              { label: 'PDF', value: 'application/pdf' },
            ];
          case 'application/vnd.google-apps.presentation':
            return [
              { label: 'PDF', value: 'application/pdf' },
              {
                label: 'PowerPoint (PPTX)',
                value:
                  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              },
            ];
          default:
            return [{ label: 'PDF', value: 'application/pdf' }];
        }
      },
    }),
    createMarkdownField({
      id: 'markdown',
      markdown:
        'Exporting a file will generate a link to download the file. This link will only be available for 24 hours.',
    }),
  ],
  aiSchema: z.object({
    file: z.string().min(1).describe('The ID of the file to export'),
    format: z
      .enum([
        'application/pdf',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'text/html',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/csv',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
      ])
      .describe('The format to export the file in'),
  }),
  run: async ({ configValue, connection, workspaceId, s3 }) => {
    const googleDrive = shared.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const fileToExportId = configValue.file;
    const exportFormat = configValue.format;

    const fileMetadata = await googleDrive.files.get({
      fileId: fileToExportId,
      fields: 'name',
    });

    const fileName = fileMetadata.data.name;
    const fileExtension =
      path.extname(fileName) || mimeToExtensionMap[exportFormat] || '';
    const baseFileName = path.basename(fileName, fileExtension);

    const exportedFile = await googleDrive.files.export(
      {
        fileId: fileToExportId,
        mimeType: exportFormat,
      },
      { responseType: 'arraybuffer' },
    );

    const filePath = `temp/workspaces/${workspaceId}/created-at/${Date.now()}/${baseFileName}${fileExtension}`;

    await s3.uploadBufferFile({
      buffer: exportedFile.data as Buffer,
      fileName: fileName + fileExtension,
      filePath,
    });

    const url = await s3.getSignedRetrievalUrl(filePath, {
      expiresInMinutes: 1440,
    });

    return {
      fileUrl: url,
      fileType: exportFormat,
      fileName,
      exportTime: new Date().toISOString(),
    };
  },

  mockRun: async () => {
    return {
      fileUrl: 'https://example.com/mock-file-url',
      fileType: 'application/pdf',
      fileName: 'mock-file-name',
      exportTime: new Date().toISOString(),
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

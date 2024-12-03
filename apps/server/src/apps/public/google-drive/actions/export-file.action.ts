import * as path from 'path';
import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { GoogleDrive } from '../google-drive.app';

export class ExportFile extends Action {
  app: GoogleDrive;
  id = 'google-drive_action_export-file';
  name = 'Export File';
  description =
    'Exports a file from Google Drive in the specified format based on the file type.';
  aiSchema = z.object({
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
  });
  inputConfig: InputConfig[] = [
    {
      ...this.app.dynamicSelectExportableFile(),
      label: 'File to Export',
      description: '',
    },
    {
      id: 'format',
      label: 'Export Format',
      description: 'Select the format to export the file',
      inputType: 'dynamic-select',
      loadOptions: {
        dependsOn: ['file'],
        forceRefresh: true,
      },
      _getDynamicValues: async ({ connection, extraOptions }) => {
        const file = extraOptions['file'];

        if (file == null) {
          throw new Error('File ID is required');
        }

        const googleDrive = await this.app.googleDrive({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        const fileToExportId = file;
        const fileMetadata = await googleDrive.files.get({
          fileId: fileToExportId,
          fields: 'mimeType',
        });

        const mimeType = fileMetadata.data.mimeType;

        // Provide export format options based on MIME type
        switch (mimeType) {
          case 'application/vnd.google-apps.document': // Google Docs
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
          case 'application/vnd.google-apps.spreadsheet': // Google Sheets
            return [
              {
                label: 'Excel (XLSX)',
                value:
                  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
              },
              { label: 'CSV', value: 'text/csv' },
              { label: 'PDF', value: 'application/pdf' },
            ];
          case 'application/vnd.google-apps.presentation': // Google Slides
            return [
              { label: 'PDF', value: 'application/pdf' },
              {
                label: 'PowerPoint (PPTX)',
                value:
                  'application/vnd.openxmlformats-officedocument.presentationml.presentation',
              },
            ];
          default:
            return [
              { label: 'PDF', value: 'application/pdf' }, // Fallback to PDF
            ];
        }
      },
      required: {
        missingMessage: 'Export format is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'markdown',
      label: '',
      description: '',
      inputType: 'markdown',
      markdown:
        'Exporting a file will generate a link to download the file. This link will only be available for 24 hours.',
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

    const fileToExportId = configValue['file'];
    const exportFormat = configValue['format'];

    // Fetch the file metadata to get the name
    const fileMetadata = await googleDrive.files.get({
      fileId: fileToExportId,
      fields: 'name', // Fetch only the name field
    });

    const fileName = fileMetadata.data.name;
    const fileExtension =
      path.extname(fileName) || mimeToExtensionMap[exportFormat] || '';
    const baseFileName = path.basename(fileName, fileExtension); // Get the base name without extension

    // Exports the file in the specified format
    const exportedFile = await googleDrive.files.export(
      {
        fileId: fileToExportId,
        mimeType: exportFormat,
      },
      { responseType: 'arraybuffer' }, // Use arraybuffer to download binary file
    );

    // Include the file extension in the path
    const filePath = `temp/workspaces/${workspaceId}/created-at/${Date.now()}/${baseFileName}${fileExtension}`;

    await this.app.s3.uploadBufferFile({
      buffer: exportedFile.data as Buffer,
      fileName: fileName + fileExtension, // Keep original name if needed
      filePath,
    });

    const url = await this.app.s3.getSignedRetrievalUrl(filePath, {
      expiresInMinutes: 1440,
    });

    return {
      fileUrl: url,
      fileType: exportFormat,
      fileName, // Include the name of the file
      exportTime: new Date().toISOString(),
    };
  }

  async mockRun(): Promise<Response> {
    return {
      fileUrl: 'https://example.com/mock-file-url',
      fileType: 'application/pdf',
      fileName: 'mock-file-name',
      exportTime: new Date().toISOString(),
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
  exportTime: string;
};

type ConfigValue = z.infer<ExportFile['aiSchema']>;

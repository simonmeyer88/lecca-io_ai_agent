import { createDynamicSelectInputField } from '@lecca-io/toolkit';
import { google } from 'googleapis';

export const shared = {
  fields: {
    dynamicSelectFile: createDynamicSelectInputField({
      id: 'file',
      label: 'File',
      description: 'Select a file',
      placeholder: 'Select file',
      _getDynamicValues: async ({ connection }) => {
        const drive = await shared.googleDrive({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        const files = await drive.files.list({
          q: "trashed=false and mimeType != 'application/vnd.google-apps.folder'",
          orderBy: 'modifiedByMeTime desc,name_natural',
          includeItemsFromAllDrives: true,
          supportsAllDrives: true,
        });

        return files?.data?.files?.map((file) => ({
          value: file.id,
          label: file.name,
        }));
      },
      required: {
        missingMessage: 'File is required',
        missingStatus: 'warning',
      },
    }),
    dynamicSelectFolder: createDynamicSelectInputField({
      id: 'folder',
      label: 'Folder',
      description: 'Select a folder',
      placeholder: 'Select folder',
      selectOptions: [
        {
          label: 'Root',
          value: 'root',
        },
      ],
      defaultValue: 'root',
      _getDynamicValues: async ({ connection }) => {
        const drive = await shared.googleDrive({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        const folders = await drive.files.list({
          q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
          fields: '*',
          orderBy: 'modifiedByMeTime desc,name_natural',
          includeItemsFromAllDrives: true,
          supportsAllDrives: true,
        });

        return folders?.data?.files?.map((folder) => ({
          value: folder.id,
          label: folder.name,
        }));
      },
      required: {
        missingMessage: 'Folder is required',
        missingStatus: 'warning',
      },
    }),
    dynamicSelectExportableFile: createDynamicSelectInputField({
      id: 'file',
      label: 'File',
      description: 'Select a file',
      placeholder: 'Select file',
      _getDynamicValues: async ({ connection }) => {
        const drive = await shared.googleDrive({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        // Allow only specific MIME types for export (whitelist)
        const allowedMimeTypes = [
          'application/vnd.google-apps.document', // Google Docs
          'application/vnd.google-apps.spreadsheet', // Google Sheets
          'application/vnd.google-apps.presentation', // Google Slides
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel
          'text/plain', // TXT
          // Add more MIME types as needed
        ];

        const mimeTypeQuery = allowedMimeTypes
          .map((mimeType) => `mimeType='${mimeType}'`)
          .join(' or ');

        const query = `
          trashed=false 
          and (${mimeTypeQuery})
        `;

        const files = await drive.files.list({
          q: query,
          orderBy: 'modifiedByMeTime desc,name_natural',
          includeItemsFromAllDrives: true,
          supportsAllDrives: true,
        });

        return files?.data?.files?.map((file) => ({
          value: file.id,
          label: file.name,
        }));
      },
      required: {
        missingMessage: 'File is required',
        missingStatus: 'warning',
      },
    }),
    dynamicSelectDownloadableFile: createDynamicSelectInputField({
      id: 'file',
      label: 'File',
      description: 'Select a file that can be downloaded',
      placeholder: 'Select file',
      _getDynamicValues: async ({ connection }) => {
        const drive = await shared.googleDrive({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        // Extensive list of MIME types that can be downloaded
        const allowedMimeTypes = [
          'application/pdf', // PDF
          'image/jpeg', // JPEG Image
          'image/png', // PNG Image
          'image/gif', // GIF Image
          'image/bmp', // BMP Image
          'image/tiff', // TIFF Image
          'application/zip', // ZIP Archive
          'application/x-7z-compressed', // 7z Archive
          'application/x-rar-compressed', // RAR Archive
          'application/vnd.ms-powerpoint', // PowerPoint PPT
          'application/vnd.openxmlformats-officedocument.presentationml.presentation', // PowerPoint PPTX
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // Excel XLSX
          'application/vnd.ms-excel', // Excel XLS
          'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // Word DOCX
          'application/msword', // Word DOC
          'application/rtf', // Rich Text Format
          'text/plain', // Plain Text
          'text/csv', // CSV
          'text/html', // HTML
          'application/json', // JSON
          'audio/mpeg', // MP3 Audio
          'audio/wav', // WAV Audio
          'audio/ogg', // OGG Audio
          'video/mp4', // MP4 Video
          'video/quicktime', // QuickTime Video
          'video/x-msvideo', // AVI Video
          'video/x-matroska', // MKV Video
          'video/webm', // WebM Video
          // Add more downloadable MIME types as needed
        ];

        const mimeTypeQuery = allowedMimeTypes
          .map((mimeType) => `mimeType='${mimeType}'`)
          .join(' or ');

        const query = `
        trashed=false 
        and (${mimeTypeQuery})
      `;

        const files = await drive.files.list({
          q: query,
          orderBy: 'modifiedByMeTime desc,name_natural',
          includeItemsFromAllDrives: true,
          supportsAllDrives: true,
        });

        return files?.data?.files?.map((file) => ({
          value: file.id,
          label: file.name,
        }));
      },
      required: {
        missingMessage: 'File is required',
        missingStatus: 'warning',
      },
    }),
  },
  googleDrive({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }) {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.INTEGRATION_GOOGLE_DRIVE_CLIENT_ID,
      process.env.INTEGRATION_GOOGLE_DRIVE_CLIENT_SECRET,
      `${process.env.SERVER_URL}/workflow-apps/oauth2callback`,
    );

    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    return google.drive({
      version: 'v3',
      auth: oAuth2Client,
    });
  },
};

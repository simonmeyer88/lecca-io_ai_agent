import { google } from 'googleapis';

import { Action } from '@/apps/lib/action';
import { App } from '@/apps/lib/app';
import { Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { Trigger } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { CopyFile } from './actions/copy-file.action';
import { CreateFolder } from './actions/create-folder.action';
import { DeleteFile } from './actions/delete-file.action';
import { DownloadFile } from './actions/download-file.action';
import { ExportFile } from './actions/export-file.action';
import { FindFileByTitle } from './actions/find-file-by-title.action';
import { FindFolderByTitle } from './actions/find-folder-by-title.action';
import { MoveFile } from './actions/move-file.action';
import { MoveFolder } from './actions/move-folder.action';
import { ShareFile } from './actions/share-file.action';
import { ShareFolder } from './actions/share-folder.action';
import { GoogleDriveOAuth2 } from './connections/google-drive.oauth2';
import { NewFileInFolder } from './triggers/new-file-in-folder.trigger';
import { NewFile } from './triggers/new-file.trigger';

export class GoogleDrive extends App {
  id = 'google-drive';
  name = 'Google Drive';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description =
    'Google Drive is a cloud-based storage service that enables users to store and access files online.';

  //THIS IS DISABLED UNTIL GOOGLE APPROVES OUR APP AFTER WE GET CASA 3 CERTIFIED
  isPublished = true;

  connections(): Connection[] {
    return [new GoogleDriveOAuth2({ app: this })];
  }

  actions(): Action[] {
    return [
      new FindFileByTitle({ app: this }),
      new FindFolderByTitle({ app: this }),
      new ExportFile({ app: this }),
      new DownloadFile({ app: this }),
      new CopyFile({ app: this }),
      new CreateFolder({ app: this }),
      new ShareFolder({ app: this }),
      new ShareFile({ app: this }),
      new MoveFile({ app: this }),
      new MoveFolder({ app: this }),
      new DeleteFile({ app: this }),
    ];
  }

  triggers(): Trigger[] {
    return [new NewFile({ app: this }), new NewFileInFolder({ app: this })];
  }

  async googleDrive({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }) {
    const oAuth2Client = this.getOAuth2Client();
    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const sheets = google.drive({
      version: 'v3',
      auth: oAuth2Client,
    });

    return sheets;
  }

  dynamicSelectFolder(): InputConfig {
    return {
      id: 'folder',
      label: 'Folder',
      description: 'Select a folder',
      inputType: 'dynamic-select',
      placeholder: 'Select folder',
      selectOptions: [
        {
          label: 'Root',
          value: 'root',
        },
      ],
      defaultValue: 'root',
      _getDynamicValues: async ({ connection }) => {
        const drive = await this.googleDrive({
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
    };
  }

  dynamicSelectFile(): InputConfig {
    return {
      id: 'file',
      label: 'File',
      description: 'Select a file',
      inputType: 'dynamic-select',
      placeholder: 'Select file',
      _getDynamicValues: async ({ connection }) => {
        const drive = await this.googleDrive({
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
    };
  }

  dynamicSelectExportableFile(): InputConfig {
    return {
      id: 'file',
      label: 'File',
      description: 'Select a file',
      inputType: 'dynamic-select',
      placeholder: 'Select file',
      _getDynamicValues: async ({ connection }) => {
        const drive = await this.googleDrive({
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
    };
  }

  dynamicSelectDownloadableFile(): InputConfig {
    return {
      id: 'file',
      label: 'File',
      description: 'Select a file that can be downloaded',
      inputType: 'dynamic-select',
      placeholder: 'Select file',
      _getDynamicValues: async ({ connection }) => {
        const drive = await this.googleDrive({
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
    };
  }

  getOAuth2Client() {
    const GOOGLE_CLIENT_ID = ServerConfig.INTEGRATIONS.GOOGLE_DRIVE_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET =
      ServerConfig.INTEGRATIONS.GOOGLE_DRIVE_CLIENT_SECRET;
    const GOOGLE_CALLBACK_URL = `${ServerConfig.SERVER_URL}/workflow-apps/oauth2callback`;

    const oAuth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_CALLBACK_URL,
    );

    return oAuth2Client as any;
  }
}

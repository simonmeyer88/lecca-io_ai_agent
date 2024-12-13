import { createApp } from '@lecca-io/toolkit';

import { copyFile } from './actions/copy-file.action';
import { createFolder } from './actions/create-folder.action';
import { deleteFile } from './actions/delete-file.action';
import { downloadFile } from './actions/download-file.action';
import { exportFile } from './actions/export-file.action';
import { findFileByTitle } from './actions/find-file-by-title.action';
import { findFolderByTitle } from './actions/find-folder-by-title.action';
import { moveFile } from './actions/move-file.action';
import { moveFolder } from './actions/move-folder.action';
import { shareFile } from './actions/share-file.action';
import { shareFolder } from './actions/share-folder.action';
import { googleDriveOAuth2 } from './connections/google-drive.oauth2';
import { newFileInFolder } from './triggers/new-file-in-folder.trigger';
import { newFile } from './triggers/new-file.trigger';

export const googleDrive = createApp({
  id: 'google-drive',
  name: 'Google Drive',
  description:
    'Google Drive is a cloud-based storage service that enables users to store and access files online.',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/google-drive.svg',
  actions: [
    findFileByTitle,
    findFolderByTitle,
    exportFile,
    downloadFile,
    copyFile,
    createFolder,
    shareFolder,
    shareFile,
    moveFile,
    moveFolder,
    deleteFile,
  ],
  triggers: [newFileInFolder, newFile],
  connections: [googleDriveOAuth2],
  needsConnection: true,
});

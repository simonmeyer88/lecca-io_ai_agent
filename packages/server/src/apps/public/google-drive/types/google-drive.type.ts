export type GoogleDriveFolderType = {
  id: string;
  name: string;
  webViewLink: string;
  createdTime: string;
};

export type GoogleDriveFilePollType = {
  documentId: string;
  title: string;
  createdTime: string;
};

export type GoogleDriveFileDeleteResponseType = {
  fileId: string;
};

export type GoogleDriveShareRoles = 'owner' | 'writer' | 'commenter' | 'reader';

export type GoogleDriveShareFolderType = {
  folderId: string;
  role: GoogleDriveShareRoles;
  emailAddress: string;
};

export type GoogleDriveShareFileType = {
  fileId: string;
  role: GoogleDriveShareRoles;
  emailAddress: string;
};

export type GoogleDriveFileSearchResult = {
  fileId: string;
  title: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
};

export type GoogleDriveCopyFileResponseType = {
  id: string;
  newFileName: string;
  webViewLink: string;
  createdTime: string;
};

export type GoogleDocumentType = {
  documentId: string;
  revisionId: string;
  title: string;
};

export type GoogleDocumentShareType = {
  documentId: string;
  role: GoogleDocumentShareRoles;
  emailAddress: string;
};

export type GoogleDocumentShareRoles =
  | 'owner'
  | 'writer'
  | 'commenter'
  | 'reader';

export type GoogleDocumentSearchResult = {
  documentId: string;
  title: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
};

export type GoogleDocumentPollType = {
  documentId: string;
  title: string;
  createdTime: string;
};

export type GoogleDocumentInFolderPollType = {
  folderId: string;
  documentId: string;
  documentTitle: string;
  folderTitle: string;
  createdTime: string;
};

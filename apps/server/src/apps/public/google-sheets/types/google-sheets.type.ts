export type GoogleSheetsInFolderPollType = {
  folderId: string;
  spreadsheetId: string;
  spreadsheetTitle: string;
  folderTitle: string;
  createdTime: string;
};

export type GoogleSheetsPollType = {
  spreadsheetId: string;
  title: string;
  createdTime: string;
};

export type GoogleSheetsWorksheetPollType = {
  spreadsheetId: string;
  sheetId: string;
  sheetTitle: string;
};

export type GoogleSheetsSpreadsheetDeleteResponseType = {
  spreadsheetId: string;
};

export type GoogleSheetsSheetDeleteResponseType = {
  sheetId: string;
  deleted: true;
};

export type GoogleSheetsSearchResult = {
  spreadsheetId: string;
  title: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink: string;
};

export type GoogleSheetsShareRoles =
  | 'owner'
  | 'writer'
  | 'commenter'
  | 'reader';

export type GoogleSheetsSpreadsheetShareType = {
  spreadsheetId: string;
  role: GoogleSheetsShareRoles;
  emailAddress: string;
};

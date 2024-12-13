import { createApp } from '@lecca-io/toolkit';

import { addRowToSheet } from './actions/add-row-to-sheet.action';
import { createSheet } from './actions/create-sheet.action';
import { createSpreadsheet } from './actions/create-spreadsheet.action';
import { deleteSheet } from './actions/delete-sheet.action';
import { findSpreadsheetByTitle } from './actions/find-spreadsheet-by-title.action';
import { getSheetData } from './actions/get-sheet-data.action';
import { listSheets } from './actions/list-sheets.action';
import { listSpreadsheets } from './actions/list-spreadsheets.action';
import { lookupSpreadsheetRow } from './actions/lookup-spreadsheet-row.action';
import { renameSheet } from './actions/rename-sheet.action';
import { renameSpreadsheet } from './actions/rename-spreadsheet.action';
import { updateCell } from './actions/update-cell.action';
import { googleSheetsOAuth2 } from './connections/google-sheets.oauth2';
import { newRowAdded } from './triggers/new-row-added.trigger';
import { newSheet } from './triggers/new-sheet.trigger';
import { newSpreadsheetInFolder } from './triggers/new-spreadsheet-in-folder.trigger';
import { newSpreadsheet } from './triggers/new-spreadsheet.trigger';

export const googleSheets = createApp({
  id: 'google-sheets',
  name: 'Google Sheets',
  description: 'Use Google Sheets to create and edit online spreadsheets.',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/google-sheets.svg',
  actions: [
    addRowToSheet,
    getSheetData,
    updateCell,
    createSpreadsheet,
    createSheet,
    lookupSpreadsheetRow,
    findSpreadsheetByTitle,
    renameSpreadsheet,
    renameSheet,
    listSpreadsheets,
    listSheets,
    deleteSheet,
    // shareSpreadsheet, // Need scope auth/drive to do this.
    // deleteSpreadsheet, // Need scope auth/drive to do this.
  ],
  triggers: [newRowAdded, newSpreadsheet, newSpreadsheetInFolder, newSheet],
  connections: [googleSheetsOAuth2],
  needsConnection: true,
});

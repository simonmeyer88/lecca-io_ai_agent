import { BadRequestException } from '@nestjs/common';
import { google } from 'googleapis';

import { Action } from '@/apps/lib/action';
import { App } from '@/apps/lib/app';
import { Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { Trigger } from '@/apps/lib/trigger';
import { ServerConfig } from '@/config/server.config';

import { AddRowToSheet } from './actions/add-row-to-sheet.action';
import { CreateSheet } from './actions/create-sheet.action';
import { CreateSpreadsheet } from './actions/create-spreadsheet.action';
import { DeleteSheet } from './actions/delete-sheet.action';
import { FindSpreadsheetByTitle } from './actions/find-spreadsheet-by-title.action';
import { GetSheetData } from './actions/get-sheet-data.action';
import { ListSheets } from './actions/list-sheets.action';
import { ListSpreadsheets } from './actions/list-spreadsheets.action';
import { LookupSpreadsheetRow } from './actions/lookup-spreadsheet-row.action';
import { RenameSheet } from './actions/rename-sheet.action';
import { RenameSpreadsheet } from './actions/rename-spreadsheet.action';
import { UpdateCell } from './actions/update-cell.action';
import { GoogleSheetsOAuth2 } from './connections/google-sheets.oauth2';
import { NewRowAdded } from './triggers/new-row-added.trigger';
import { NewSheet } from './triggers/new-sheet.trigger';
import { NewSpreadsheetInFolder } from './triggers/new-spreadsheet-in-folder.trigger';
import { NewSpreadsheet } from './triggers/new-spreadsheet.trigger';

export class GoogleSheets extends App {
  id = 'google-sheets';
  name = 'Google Sheets';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description = 'Use Google Sheets to create and edit online spreadsheets.';
  isPublished = true;

  connections(): Connection[] {
    return [new GoogleSheetsOAuth2({ app: this })];
  }

  actions(): Action[] {
    return [
      // new InsertRow({ app: this }),
      new AddRowToSheet({ app: this }),
      new GetSheetData({ app: this }),
      new UpdateCell({ app: this }),
      new CreateSpreadsheet({ app: this }),
      new CreateSheet({ app: this }),
      new LookupSpreadsheetRow({ app: this }),
      new FindSpreadsheetByTitle({ app: this }),
      new RenameSpreadsheet({ app: this }),
      new RenameSheet({ app: this }),
      new ListSpreadsheets({ app: this }),
      new ListSheets({ app: this }),
      new DeleteSheet({ app: this }),

      // Cannot use until we get the proper /auth/drive permission
      // new ShareSpreadsheet({ app: this }),
      // new DeleteSpreadsheet({ app: this }),
    ];
  }

  triggers(): Trigger[] {
    return [
      new NewRowAdded({ app: this }),
      new NewSpreadsheet({ app: this }),
      new NewSpreadsheetInFolder({ app: this }),
      new NewSheet({ app: this }),
    ];
  }

  async googleSheets({
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

    const sheets = google.sheets({
      version: 'v4',
      auth: oAuth2Client,
    });

    return sheets;
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

  dynamicSelectSpreadSheets(): InputConfig {
    return {
      label: 'Spreadsheet',
      id: 'spreadsheet',
      inputType: 'dynamic-select',
      placeholder: 'Select spreadsheet',
      description: 'The spreadsheet to access',
      _getDynamicValues: async ({ connection }) => {
        const drive = await this.googleDrive({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        //Get all spreadsheets from drive
        const spreadSheets = await drive.files.list({
          q: "mimeType='application/vnd.google-apps.spreadsheet'",
        });

        return (
          spreadSheets?.data?.files?.map((file) => {
            return {
              value: file.id,
              label: file.name,
            };
          }) ?? []
        );
      },
      required: {
        missingMessage: 'Spreadsheet is required',
        missingStatus: 'warning',
      },
    };
  }

  dynamicSelectSheetIds(): InputConfig {
    return {
      label: 'Sheet',
      id: 'sheet',
      inputType: 'dynamic-select',
      placeholder: 'Select sheet',
      description: 'The sheet ID',
      _getDynamicValues: async ({ connection, extraOptions }) => {
        const spreadsheetId = extraOptions?.spreadsheet;

        if (spreadsheetId === undefined) {
          throw new BadRequestException('Spreadsheet ID is required');
        } else if (typeof spreadsheetId !== 'string') {
          throw new BadRequestException('Spreadsheet ID must be a string');
        }

        const sheets = await this.googleSheets({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        const spreadSheet = await sheets.spreadsheets.get({
          spreadsheetId,
        });

        return (
          spreadSheet?.data?.sheets?.map((sheet) => {
            return {
              value: sheet.properties?.sheetId?.toString(),
              label: sheet.properties?.title as string,
            };
          }) ?? []
        );
      },
      required: {
        missingMessage: 'Sheet is required',
        missingStatus: 'warning',
      },
      loadOptions: {
        dependsOn: ['spreadsheet'],
      },
    };
  }

  dynamicSelectSheetNames(): InputConfig {
    return {
      label: 'Sheet',
      id: 'sheet',
      inputType: 'dynamic-select',
      placeholder: 'Select sheet',
      description: 'The sheet name',
      _getDynamicValues: async ({ connection, extraOptions }) => {
        const spreadsheetId = extraOptions?.spreadsheet;

        if (spreadsheetId === undefined) {
          throw new BadRequestException('Spreadsheet ID is required');
        } else if (typeof spreadsheetId !== 'string') {
          throw new BadRequestException('Spreadsheet ID must be a string');
        }

        const sheets = await this.googleSheets({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        const spreadSheet = await sheets.spreadsheets.get({
          spreadsheetId,
        });

        return (
          spreadSheet?.data?.sheets?.map((sheet) => {
            return {
              value: sheet.properties?.title as string,
              label: sheet.properties?.title as string,
            };
          }) ?? []
        );
      },
      required: {
        missingMessage: 'Sheet is required',
        missingStatus: 'warning',
      },
      loadOptions: {
        dependsOn: ['spreadsheet'],
        forceRefresh: true,
      },
    };
  }

  headerRowNumber(): InputConfig {
    return {
      id: 'headerRowNumber',
      description: 'The row number your header row is located on.',
      inputType: 'number',
      numberOptions: {
        min: 1,
      },
      loadOptions: {
        dependsOn: ['sheet'],
      },
      label: 'Header Row Number',
      defaultValue: 1,
    };
  }

  dynamicSelectHeadersMap(): InputConfig {
    return {
      id: 'mappings',
      label: 'New Row Values',
      description: 'Add new row values for your columns',
      loadOptions: {
        dependsOn: ['spreadsheet', 'sheet', 'headerRowNumber'],
        forceRefresh: true,
      },
      occurenceType: 'dynamic',
      inputType: 'map',
      mapOptions: {
        keyPlaceholder: 'empty', //This will be displayed for the empty headers + the field will be disabled
        valuePlaceholder: 'Add cell value',
        disableKeyInput: true,
      },
      _getDynamicValues: async ({ connection, extraOptions }) => {
        const { sheet, spreadsheet, headerRowNumber } = extraOptions;

        if (spreadsheet === undefined) {
          throw new BadRequestException('Spreadsheet ID is required');
        } else if (sheet === undefined) {
          throw new BadRequestException('Sheet Name is required');
        } else if (headerRowNumber === undefined) {
          throw new BadRequestException('Header row number is required');
        }

        const googleSheet = await this.googleSheets({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        const headerRange = `${sheet}!${headerRowNumber}:${headerRowNumber}`;

        const headerRow = await googleSheet.spreadsheets.values.get({
          spreadsheetId: spreadsheet,
          range: headerRange,
        });

        const headers = headerRow.data.values ? headerRow.data.values[0] : [];

        const dynamicValues = headers.map((header) => ({
          label: header,
          value: header,
        }));

        return dynamicValues;
      },
    };
  }

  dynamicSelectColumnsDropdown(): InputConfig {
    return {
      id: 'column',
      label: 'Column',
      description: 'A column in your sheet',
      loadOptions: {
        dependsOn: ['spreadsheet', 'sheet'],
        forceRefresh: true,
      },
      placeholder: 'Select a column',
      inputType: 'dynamic-select',
      _getDynamicValues: async ({ connection, extraOptions }) => {
        const { sheet, spreadsheet } = extraOptions;

        if (spreadsheet === undefined) {
          throw new BadRequestException('Spreadsheet ID is required');
        } else if (sheet === undefined) {
          throw new BadRequestException('Sheet Name is required');
        }

        const googleSheet = await this.googleSheets({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        // Get the first row of the specified sheet to determine the number of columns
        const columns = await googleSheet.spreadsheets.values.get({
          spreadsheetId: spreadsheet,
          range: `${sheet}!1:1`,
        });

        // If there is a header row, we'll take that into account; otherwise, assume 26 columns (A-Z)
        const numCols = columns.data.values
          ? columns.data.values[0].length
          : 26;
        const dynamicValues = Array.from({ length: numCols }, (_, i) => {
          const colLetter = this.getColumnLetter(i);
          return { label: colLetter, value: i.toString() };
        });

        return dynamicValues;
      },
      required: {
        missingMessage: 'Column is required',
        missingStatus: 'warning',
      },
    };
  }

  // Utility function to generate column letters
  getColumnLetter(colIndex: number): string {
    let letter = '';
    let temp;
    while (colIndex >= 0) {
      temp = colIndex % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      colIndex = (colIndex - temp - 1) / 26;
    }
    return letter;
  }

  getOAuth2Client() {
    const GOOGLE_CLIENT_ID = ServerConfig.INTEGRATIONS.GOOGLE_SHEETS_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET =
      ServerConfig.INTEGRATIONS.GOOGLE_SHEETS_CLIENT_SECRET;
    const GOOGLE_CALLBACK_URL = `${ServerConfig.SERVER_URL}/workflow-apps/oauth2callback`;

    const oAuth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_CALLBACK_URL,
    );

    return oAuth2Client as any;
  }
}

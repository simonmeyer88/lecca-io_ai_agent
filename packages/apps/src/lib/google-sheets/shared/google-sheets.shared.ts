import {
  FieldConfig,
  createDynamicSelectInputField,
  createNumberInputField,
} from '@lecca-io/toolkit';
import { google } from 'googleapis';

export const shared = {
  fields: {
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
    dynamicSelectSpreadSheets: createDynamicSelectInputField({
      label: 'Spreadsheet',
      id: 'spreadsheet',
      placeholder: 'Select spreadsheet',
      description: 'The spreadsheet to access',
      _getDynamicValues: async ({ connection }) => {
        const drive = await shared.googleDrive({
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
    }),
    dynamicSelectSheetIds: createDynamicSelectInputField({
      label: 'Sheet',
      id: 'sheet',
      placeholder: 'Select sheet',
      description: 'The sheet ID',
      _getDynamicValues: async ({ connection, extraOptions }) => {
        const spreadsheetId = extraOptions?.spreadsheet;

        if (spreadsheetId === undefined) {
          throw new Error('Spreadsheet ID is required');
        } else if (typeof spreadsheetId !== 'string') {
          throw new Error('Spreadsheet ID must be a string');
        }

        const sheets = await shared.googleSheets({
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
    }),
    dynamicSelectSheetNames: createDynamicSelectInputField({
      label: 'Sheet',
      id: 'sheet',
      placeholder: 'Select sheet',
      description: 'The sheet name',
      _getDynamicValues: async ({ connection, extraOptions }) => {
        const spreadsheetId = extraOptions?.spreadsheet;

        if (spreadsheetId === undefined) {
          throw new Error('Spreadsheet ID is required');
        } else if (typeof spreadsheetId !== 'string') {
          throw new Error('Spreadsheet ID must be a string');
        }

        const sheets = await shared.googleSheets({
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
    }),
    dynamicSelectHeadersMap: {
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
          throw new Error('Spreadsheet ID is required');
        } else if (sheet === undefined) {
          throw new Error('Sheet Name is required');
        } else if (headerRowNumber === undefined) {
          throw new Error('Header row number is required');
        }

        const googleSheet = await shared.googleSheets({
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
    } as FieldConfig,
    dynamicSelectColumnsDropdown: createDynamicSelectInputField({
      id: 'column',
      label: 'Column',
      description: 'A column in your sheet',
      loadOptions: {
        dependsOn: ['spreadsheet', 'sheet'],
        forceRefresh: true,
      },
      placeholder: 'Select a column',
      _getDynamicValues: async ({ connection, extraOptions }) => {
        const { sheet, spreadsheet } = extraOptions;

        if (spreadsheet === undefined) {
          throw new Error('Spreadsheet ID is required');
        } else if (sheet === undefined) {
          throw new Error('Sheet Name is required');
        }

        const googleSheet = await shared.googleSheets({
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
          const colLetter = shared.getColumnLetter(i);
          return { label: colLetter, value: i.toString() };
        });

        return dynamicValues;
      },
      required: {
        missingMessage: 'Column is required',
        missingStatus: 'warning',
      },
    }),
    headerRowNumber: createNumberInputField({
      id: 'headerRowNumber',
      description: 'The row number your header row is located on.',
      numberOptions: {
        min: 1,
      },
      loadOptions: {
        dependsOn: ['sheet'],
      },
      label: 'Header Row Number',
      defaultValue: 1,
    }),
  },
  googleSheets({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }) {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.INTEGRATION_GOOGLE_SHEETS_CLIENT_ID,
      process.env.INTEGRATION_GOOGLE_SHEETS_CLIENT_SECRET,
      `${process.env.SERVER_URL}/workflow-apps/oauth2callback`,
    );

    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    return google.sheets({
      version: 'v4',
      auth: oAuth2Client,
    });
  },
  googleDrive({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }) {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.INTEGRATION_GOOGLE_SHEETS_CLIENT_ID,
      process.env.INTEGRATION_GOOGLE_SHEETS_CLIENT_SECRET,
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
  /**
   *  Utility function to generate column letters
   */
  getColumnLetter(colIndex: number): string {
    let letter = '';
    let temp;
    while (colIndex >= 0) {
      temp = colIndex % 26;
      letter = String.fromCharCode(temp + 65) + letter;
      colIndex = (colIndex - temp - 1) / 26;
    }
    return letter;
  },
};

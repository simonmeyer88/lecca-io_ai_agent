import { createItemBasedPollTrigger } from '@lecca-io/toolkit';

import { shared } from '../shared/google-sheets.shared';

export const newSheet = createItemBasedPollTrigger({
  id: 'google-sheets_trigger_new-sheet',
  name: 'New Sheet',
  description:
    'Triggers when a new sheet is created in a spreadsheet. New sheet must be at the end of the list of sheets in the spreadsheet.',
  inputConfig: [
    {
      ...shared.fields.dynamicSelectSpreadSheets,
      description: 'Select the spreadsheet to monitor for new sheets',
    },
  ],
  run: async ({ connection, configValue }) => {
    const googleSheets = shared.googleSheets({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { spreadsheet } = configValue;

    // Search for new sheets in a spreadsheet
    const newestSheets = await googleSheets.spreadsheets.get({
      spreadsheetId: spreadsheet,
      fields: 'sheets.properties',
    });

    //Return in reverse order so that the newest sheet is first
    return (
      newestSheets?.data?.sheets
        ?.map((sheet) => ({
          spreadsheetId: spreadsheet,
          sheetId: sheet.properties?.sheetId?.toString(),
          sheetTitle: sheet.properties?.title,
        }))
        ?.reverse() ?? []
    );
  },
  mockRun: async () => {
    return [
      {
        spreadsheetId: 'mock-sheet-id',
        sheetId: 'mock-sheet-id',
        sheetTitle: 'Mock Sheet Title',
      },
    ];
  },
  extractItemIdentifierFromResponse(args): string {
    return args.response.sheetId;
  },
});

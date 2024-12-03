import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { GoogleSheets } from '../google-sheets.app';
import { GoogleSheetsSearchResult } from '../types/google-sheets.type';

export class FindSpreadsheetByTitle extends Action {
  app: GoogleSheets;
  id = 'google-sheets_action_find-spreadsheet-by-title';
  name = 'Find Spreadsheet(s) by Title';
  description = 'Search for a spreadsheet by the title';
  aiSchema = z.object({
    search: z
      .string()
      .min(1)
      .describe(
        'A search query to find a spreadsheet by its title. This is required to search for a spreadsheet.',
      ),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'search',
      label: 'Search Query',
      description: 'A search query to find a spreadsheet by its title',
      inputType: 'text',
      placeholder: 'Search for...',
      required: {
        missingMessage: 'Search query is required',
        missingStatus: 'warning',
      },
    },
  ];

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<GoogleSheetsSearchResult[]> {
    const googleDrive = await this.app.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { search } = configValue;

    // Construct the search query
    const searchQuery: string[] = [];
    if (search?.length) {
      searchQuery.push(`name contains '${search.replace("'", "\\'")}'`);
    }

    searchQuery.push(`mimeType='application/vnd.google-apps.spreadsheet'`);

    // Search for documents
    const foundDocuments = await googleDrive.files.list({
      q: searchQuery.join(' and '),
      // pageToken: (paginationToken as string) || undefined,
      fields:
        'nextPageToken, files(id, name, webViewLink, createdTime, modifiedTime)',
      orderBy: 'modifiedByMeTime desc,name_natural',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });

    return (
      foundDocuments.data?.files?.map((file) => ({
        spreadsheetId: file.id,
        title: file.name,
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime,
        webViewLink: file.webViewLink,
      })) || []
    );
  }

  async mockRun(): Promise<GoogleSheetsSearchResult[]> {
    return [
      {
        spreadsheetId: 'mock-spreadsheet-id',
        title: 'Mock Spreadsheet Title',
        createdTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString(),
        webViewLink: 'https://example.com',
      },
    ];
  }
}

type ConfigValue = z.infer<FindSpreadsheetByTitle['aiSchema']>;

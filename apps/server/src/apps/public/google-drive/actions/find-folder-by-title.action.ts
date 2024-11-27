import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { GoogleDrive } from '../google-drive.app';
import { GoogleDriveFileSearchResult } from '../types/google-drive.type';

export class FindFolderByTitle extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleDrive;
  id = 'google-drive_action_find-folder-by-title';
  name = 'Find Folder(s) by Title';
  description = 'Search for folder(s) by the title';
  aiSchema = z.object({
    search: z
      .string()
      .min(1)
      .describe('A search query to find a folder by its title'),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'search',
      label: 'Search Query',
      description: 'A search query to find a folder by its title',
      inputType: 'text',
      placeholder: 'Search for...',
      required: {
        missingMessage: 'Search query is required',
        missingStatus: 'warning',
      },
    },
  ];

  async run({ configValue, connection }: RunActionArgs<ConfigValue>): Promise<{
    data: GoogleDriveFileSearchResult[];
  }> {
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

    // Exclude folders from the search
    searchQuery.push(`mimeType = 'application/vnd.google-apps.folder'`);

    const foundDocuments = await googleDrive.files.list({
      q: searchQuery.join(' and '),
      fields:
        'nextPageToken, files(id, name, webViewLink, createdTime, modifiedTime)',
      orderBy: 'modifiedByMeTime desc,name_natural',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });

    return {
      data:
        foundDocuments.data?.files?.map((file) => ({
          fileId: file.id,
          title: file.name,
          createdTime: file.createdTime,
          modifiedTime: file.modifiedTime,
          webViewLink: file.webViewLink,
        })) || [],
    };
  }

  async mockRun(): Promise<{ data: GoogleDriveFileSearchResult[] }> {
    return {
      data: [
        {
          fileId: 'mock-folder-id',
          title: 'Mock Folder Title',
          createdTime: new Date().toISOString(),
          modifiedTime: new Date().toISOString(),
          webViewLink: 'https://example.com',
        },
      ],
    };
  }
}

type ConfigValue = z.infer<FindFolderByTitle['aiSchema']>;

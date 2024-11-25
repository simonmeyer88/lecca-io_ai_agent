import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { GoogleDocs } from '../google-docs.app';
import { GoogleDocumentSearchResult } from '../types/google-docs.type';
import { z } from 'zod';

export class FindDocumentByContent extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleDocs;
  id() {
    return 'google-docs_action_find-document-by-content';
  }
  name() {
    return 'Find Document(s) by Content';
  }
  description() {
    return 'Search for a document by its content.';
  }
  aiSchema() {
    return z.object({
      search: z
        .string()
        .min(1)
        .describe('A search query to find a document by its content'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        id: 'search',
        label: 'Search Query',
        description: 'A search query to find a document by its content.',
        inputType: 'text',
        placeholder: 'Search for...',
        required: {
          missingMessage: 'Search query is required',
          missingStatus: 'warning',
        },
      },
    ];
  }

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<GoogleDocumentSearchResult[]> {
    const googleDrive = await this.app.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { search } = configValue;

    // Construct the search query
    const searchQuery: string[] = [];
    if (search?.length) {
      searchQuery.push(`fullText contains '${search.replace("'", "\\'")}'`);
    }

    searchQuery.push(`mimeType='application/vnd.google-apps.document'`);

    // Search for documents
    const foundDocuments = await googleDrive.files.list({
      q: searchQuery.join(' and '),
      // pageToken: (paginationToken as string) || undefined,
      fields:
        'nextPageToken, files(id, name, webViewLink, createdTime, modifiedTime)',
      includeItemsFromAllDrives: true,
      supportsAllDrives: true,
    });

    return (
      foundDocuments.data?.files?.map((file) => ({
        documentId: file.id,
        title: file.name,
        createdTime: file.createdTime,
        modifiedTime: file.modifiedTime,
        webViewLink: file.webViewLink,
      })) || []
    );
  }

  async mockRun(): Promise<GoogleDocumentSearchResult[]> {
    return [
      {
        documentId: 'mock-document-id',
        title: 'Mock Document Title',
        createdTime: new Date().toISOString(),
        modifiedTime: new Date().toISOString(),
        webViewLink: 'https://example.com',
      },
    ];
  }
}

type ConfigValue = z.infer<ReturnType<FindDocumentByContent['aiSchema']>>;

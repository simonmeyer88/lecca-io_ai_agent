import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { GoogleDocs } from '../google-docs.app';
import { GoogleDocumentType } from '../types/google-docs.type';

export class DeleteDocument extends Action {
  app: GoogleDocs;
  id = 'google-docs_action_delete-document';
  name = 'Delete Document';
  description = 'Delete a document.';
  aiSchema = z.object({
    document: z.string().min(1).describe('The ID of the document to delete'),
  });
  inputConfig: InputConfig[] = [
    {
      ...this.app.dynamicSelectDocuments(),
      description: 'Select the document to delete.',
    },
  ];

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<
    Pick<GoogleDocumentType, 'documentId'>
  > {
    const googleDrive = await this.app.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { document } = configValue;

    await googleDrive.files.delete({
      fileId: document,
    });

    return {
      documentId: document,
    };
  }

  async mockRun(): Promise<Pick<GoogleDocumentType, 'documentId'>> {
    return {
      documentId: 'mock-document-id',
    };
  }
}

type ConfigValue = z.infer<typeof DeleteDocument.prototype.aiSchema>;

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { GoogleDocs } from '../google-docs.app';
import { GoogleDocumentType } from '../types/google-docs.type';
import { z } from 'zod';

export class DeleteDocument extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleDocs;
  id() {
    return 'google-docs_action_delete-document';
  }
  name() {
    return 'Delete Document';
  }
  description() {
    return 'Delete a document.';
  }
  aiSchema() {
    return z.object({
      document: z.string().min(1).describe('The ID of the document to delete'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        ...this.app.dynamicSelectDocuments(),
        description: 'Select the document to delete.',
      },
    ];
  }

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

type ConfigValue = z.infer<
  ReturnType<typeof DeleteDocument.prototype.aiSchema>
>;

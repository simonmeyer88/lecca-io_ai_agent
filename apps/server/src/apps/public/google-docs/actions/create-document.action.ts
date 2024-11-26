import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { GoogleDocs } from '../google-docs.app';
import { GoogleDocumentType } from '../types/google-docs.type';

export class CreateDocument extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleDocs;
  id() {
    return 'google-docs_action_create-document';
  }
  name() {
    return 'New Document';
  }
  description() {
    return 'Creates a new document with provided content.';
  }
  aiSchema() {
    return z.object({
      'new-name': z.string().min(1).describe('The name of the new document'),
      // folder: z
      //   .string()
      //   .nullable()
      //   .optional()
      //   .describe('The ID of the folder where the new document will be saved'),
      content: z.string().min(1).describe('The content of the new document'),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        id: 'new-name',
        label: 'New Document Name',
        description: 'The name of the new document.',
        inputType: 'text',
        placeholder: 'Add a name',
        required: {
          missingMessage: 'Name is required',
          missingStatus: 'warning',
        },
      },
      // {
      //   ...this.app.dynamicSelectFolder(),
      //   label: 'Target Folder (optional)',
      //   description: 'Select the folder where the new document will be saved.',
      // },
      {
        id: 'content',
        label: 'Text Content',
        description: 'The content of the new document.',
        inputType: 'text',
        placeholder: 'Enter text',
        required: {
          missingMessage: 'Content is required',
          missingStatus: 'warning',
        },
      },
    ];
  }

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<GoogleDocumentType> {
    const googleDocs = await this.app.googleDocs({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { content } = configValue;

    // Create new document with initial content.
    const newDocument = await googleDocs.documents.create({
      requestBody: {
        title: configValue['new-name'],
      },
    });

    await googleDocs.documents.batchUpdate({
      documentId: newDocument.data.documentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: {
                index: 1, // Position to insert text, 1 is the start of the document.
              },
              text: content,
            },
          },
        ],
      },
    });

    // if (folder && folder !== 'root') {
    //   const googleDrive = await this.app.googleDrive({
    //     accessToken: connection.accessToken,
    //     refreshToken: connection.refreshToken,
    //   });

    //   await googleDrive.files.update({
    //     fileId: newDocument.data.documentId,
    //     addParents: folder,
    //     removeParents: 'root',
    //     fields: 'id',
    //   });
    // }

    return {
      documentId: newDocument.data.documentId,
      revisionId: newDocument.data.revisionId,
      title: newDocument.data.title,
    };
  }

  async mockRun(): Promise<GoogleDocumentType> {
    return {
      documentId: 'mock-document-id',
      title: 'Document Title',
      revisionId: 'mock-revision-id',
    };
  }
}

type ConfigValue = z.infer<ReturnType<CreateDocument['aiSchema']>>;

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { GoogleDocs } from '../google-docs.app';
import { GoogleDocumentType } from '../types/google-docs.type';
import { z } from 'zod';

export class CreateDocumentFromTemplate extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleDocs;
  id() {
    return 'google-docs_action_create-document-from-template';
  }
  name() {
    return 'New Document from Template';
  }
  description() {
    return 'Creates a new document by filling out {{placeholders}} from a template document.';
  }
  aiSchema() {
    return z.object({
      document: z.string().min(1).describe('The ID of the template document'),
      // folder: z
      //   .string()
      //   .nullable()
      //   .optional()
      //   .describe('The ID of the folder where the new document will be saved'),
      'new-name': z.string().min(1).describe('The name of the new document'),
      placeholders: z.array(
        z.object({
          key: z.string().min(1).describe('The placeholder key'),
          value: z
            .string()
            .min(1)
            .describe('The value to replace the placeholder'),
        }),
      ),
    });
  }
  inputConfig(): InputConfig[] {
    return [
      {
        ...this.app.dynamicSelectDocuments(),
        label: 'Template Document',
        description: 'A template document has {{placeholders}}.',
      },
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
      //DONT HAVE auth/drive permissions for this
      // {
      //   ...this.app.dynamicSelectFolder(),
      //   label: 'Target Folder',
      //   description: 'Select the folder where the new document will be saved.',
      // },
      this.app.dynamicSelectPlaceholders(),
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

    const placeholderMap = configValue.placeholders;
    const templateDocumentId = configValue.document;
    // const folder = configValue.folder;
    const requests: any = [];

    // Create new document.
    //Copy contents of template document to new document.
    const newDocument = await googleDocs.documents.create({
      requestBody: {
        title: configValue['new-name'],
      },
    });

    const newDocumentId = newDocument.data.documentId;

    // Get the contents of the template document.
    const templateDocument = await googleDocs.documents.get({
      documentId: templateDocumentId,
    });

    const templateContent = templateDocument.data.body.content;

    // Insert the template content into the new document
    await googleDocs.documents.batchUpdate({
      documentId: newDocumentId,
      requestBody: {
        requests: [
          {
            insertText: {
              location: { index: 1 },
              text: templateContent
                .map((element) => {
                  if (element.paragraph) {
                    return element.paragraph.elements
                      .map((e) => (e.textRun ? e.textRun.content : ''))
                      .join('');
                  }
                  return '';
                })
                .join(''),
            },
          },
        ],
      },
    });

    placeholderMap.forEach((map) => {
      const { key, value } = map;

      requests.push({
        replaceAllText: {
          containsText: {
            text: '{{' + key + '}}',
            matchCase: true,
          },
          replaceText: String(value),
        },
      });
    });

    await googleDocs.documents.batchUpdate({
      documentId: newDocumentId,
      requestBody: {
        requests: requests,
      },
    });

    // if (folder && folder !== 'root') {
    //   const googleDrive = await this.app.googleDrive({
    //     accessToken: connection.accessToken,
    //     refreshToken: connection.refreshToken,
    //   });

    //   await googleDrive.files.update({
    //     fileId: newDocumentId,
    //     addParents: folder,
    //     removeParents: 'root',
    //     fields: 'id',
    //   });
    // }

    const updatedTemplateDocument = await googleDocs.documents.get({
      documentId: configValue.document,
    });

    return {
      documentId: updatedTemplateDocument.data.documentId,
      revisionId: updatedTemplateDocument.data.revisionId,
      title: updatedTemplateDocument.data.title,
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

type ConfigValue = z.infer<ReturnType<CreateDocumentFromTemplate['aiSchema']>>;

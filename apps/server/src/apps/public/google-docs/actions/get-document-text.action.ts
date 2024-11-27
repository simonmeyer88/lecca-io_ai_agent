import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { GoogleDocs } from '../google-docs.app';

export class GetDocumentText extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleDocs;
  id = 'google-docs_action_get-document-text';
  name = 'Get Document Text';
  description = 'Get the text of a Google Document';
  aiSchema = z.object({
    documentId: z.string().min(1).describe('The Google Document ID'),
  });
  inputConfig: InputConfig[] = [
    {
      id: 'documentId',
      label: 'Document Id',
      description: '',
      inputType: 'text',
      required: {
        missingMessage: 'Document ID is required',
        missingStatus: 'warning',
      },
    },
  ];

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<{ text: string }> {
    const docs = await this.app.googleDocs({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { documentId } = configValue;

    const document = await docs.documents.get({
      documentId: documentId,
    });

    return { text: this.#extractTextFromDocument(document.data.body.content) };
  }

  async mockRun(): Promise<{ text: string }> {
    return { text: 'The document contents would be here.' };
  }

  #extractTextFromDocument(content: any): string {
    let text = '';
    if (content) {
      content.forEach((value: any) => {
        if (value.paragraph) {
          value.paragraph.elements.forEach((elem: any) => {
            if (elem.textRun) {
              text += elem.textRun.content;
            }
          });
        }
      });
    }
    return text;
  }
}

type ConfigValue = z.infer<GetDocumentText['aiSchema']>;

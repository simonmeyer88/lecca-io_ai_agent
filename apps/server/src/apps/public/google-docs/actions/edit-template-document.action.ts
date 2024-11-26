import { z } from 'zod';

import {
  Action,
  ActionConstructorArgs,
  RunActionArgs,
} from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';

import { GoogleDocs } from '../google-docs.app';

export class EditTemplateDocument extends Action {
  constructor(args: ActionConstructorArgs) {
    super(args);
  }

  app: GoogleDocs;
  id() {
    return 'google-docs_action_edit-template-file';
  }
  name() {
    return 'Edit Template Document';
  }
  description() {
    return 'Edits a template document by replacing {{placeholders}}.';
  }
  aiSchema() {
    return z.object({
      document: z.string().min(1).describe('The ID of the template document'),
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
      this.app.dynamicSelectPlaceholders(),
    ];
  }

  async run({ configValue, connection }: RunActionArgs<ConfigValue>) {
    const googleDocs = await this.app.googleDocs({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const placeholderMap = configValue.placeholders;
    const documentId = configValue.document;
    const requests: any = [];

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
      documentId,
      requestBody: {
        requests: requests,
      },
    });

    const updatedTemplateDocument = await googleDocs.documents.get({
      documentId: configValue.document,
    });

    return {
      documentId: updatedTemplateDocument.data.documentId,
      revisionId: updatedTemplateDocument.data.revisionId,
      title: updatedTemplateDocument.data.title,
    };
  }

  async mockRun() {
    return {
      documentId: 'mock-document-id',
      title: 'Document Title',
      revisionId: 'mock-revision-id',
    };
  }
}

type ConfigValue = z.infer<ReturnType<EditTemplateDocument['aiSchema']>>;

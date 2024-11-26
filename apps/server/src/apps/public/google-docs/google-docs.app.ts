import { BadRequestException } from '@nestjs/common';
import { google } from 'googleapis';

import { Action } from '@/apps/lib/action';
import { Connection } from '@/apps/lib/connection';
import { InputConfig } from '@/apps/lib/input-config';
import { Trigger } from '@/apps/lib/trigger';
import {
  WorkflowApp,
  WorkflowAppConstructorArgs,
} from '@/apps/lib/workflow-app';
import { ServerConfig } from '@/config/server.config';

import { AppendToDocument } from './actions/append-to-document.action';
import { CreateDocumentFromTemplate } from './actions/create-document-from-template.action';
import { CreateDocument } from './actions/create-document.action';
import { EditTemplateDocument } from './actions/edit-template-document.action';
import { FindDocumentByContent } from './actions/find-document-by-content.action';
import { FindDocumentByTitle } from './actions/find-document-by-title.action';
import { GetDocumentText } from './actions/get-document-text.action';
import { GoogleDocsOAuth2 } from './connections/google-docs.oauth2';
import { NewDocumentInFolder } from './triggers/new-document-in-folder.trigger';
import { NewDocument } from './triggers/new-document.trigger';

export class GoogleDocs extends WorkflowApp {
  constructor(args: WorkflowAppConstructorArgs) {
    super(args);
  }

  id = 'google-docs';
  name = 'Google Docs';
  logoUrl = `${ServerConfig.INTEGRATION_ICON_BASE_URL}/apps/${this.id}.svg`;
  description =
    'Use Google Docs to create, and collaborate on online documents.';
  isPublished = true;

  connections(): Connection[] {
    return [new GoogleDocsOAuth2({ app: this })];
  }

  actions(): Action[] {
    return [
      new CreateDocumentFromTemplate({ app: this }),
      new CreateDocument({ app: this }),
      new EditTemplateDocument({ app: this }),
      new AppendToDocument({ app: this }),
      new FindDocumentByTitle({ app: this }),
      new FindDocumentByContent({ app: this }),
      new GetDocumentText({ app: this }),
      // new ShareDocument({ app: this }), //Need /auth/drive to do this
      // new DeleteDocument({ app: this }), //Need /auth/drive to do this
    ];
  }

  triggers(): Trigger[] {
    return [
      new NewDocument({ app: this }),
      new NewDocumentInFolder({ app: this }),
    ];
  }

  async googleDocs({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }) {
    const oAuth2Client = this.getOAuth2Client();
    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const docs = google.docs({
      version: 'v1',
      auth: oAuth2Client,
    });

    return docs;
  }

  async googleDrive({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }) {
    const oAuth2Client = this.getOAuth2Client();
    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    const drive = google.drive({
      version: 'v3',
      auth: oAuth2Client,
    });

    return drive;
  }

  dynamicSelectDocuments(): InputConfig {
    return {
      label: 'Document',
      id: 'document',
      inputType: 'dynamic-select',
      placeholder: 'Select document',
      description: 'The document to access',
      _getDynamicValues: async ({ connection }) => {
        const drive = await this.googleDrive({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        //Get all spreadsheets from drive
        const files = await drive.files.list({
          q: "mimeType='application/vnd.google-apps.document'",
        });

        return (
          files?.data?.files?.map((item) => {
            return {
              value: item.id,
              label: item.name,
            };
          }) ?? []
        );
      },
      required: {
        missingMessage: 'Document is required',
        missingStatus: 'warning',
      },
    };
  }

  dynamicSelectPlaceholders(): InputConfig {
    return {
      id: 'placeholders',
      label: 'Placeholders',
      description:
        'Fill out the placeholders in the template document, e.g. {{name}}.',
      loadOptions: {
        dependsOn: ['document'],
      },
      occurenceType: 'dynamic',
      inputType: 'map',
      _getDynamicValues: async ({ connection, extraOptions }) => {
        const documentId = extraOptions?.document;

        if (documentId === undefined) {
          throw new BadRequestException('Document ID is required');
        } else if (typeof documentId !== 'string') {
          throw new BadRequestException('Document ID must be a string');
        }

        const docs = await this.googleDocs({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        const document = await docs.documents.get({
          documentId,
        });

        const content = document?.data?.body?.content;

        if (!content) {
          return [];
        } else {
          const text = content
            .map((element: any) => {
              if (element.paragraph) {
                return element.paragraph.elements
                  .map((e: any) => (e.textRun ? e.textRun.content : ''))
                  .join('');
              }
              return '';
            })
            .join('');

          const regex = /{{(.*?)}}/g;
          let match;
          const variables = new Set();

          while ((match = regex.exec(text)) !== null) {
            variables.add(match[1].trim());
          }

          return Array.from(variables).map((variable) => {
            return {
              value: variable as string,
              label: variable as string,
            };
          });
        }
      },
    };
  }

  dynamicSelectFolder(): InputConfig {
    return {
      id: 'folder',
      label: 'Folder',
      description: 'Select a folder',
      inputType: 'dynamic-select',
      placeholder: 'Select folder',
      selectOptions: [
        {
          label: 'Root',
          value: 'root',
        },
      ],
      defaultValue: 'root',
      _getDynamicValues: async ({ connection }) => {
        const drive = await this.googleDrive({
          accessToken: connection.accessToken,
          refreshToken: connection.refreshToken,
        });

        const folders = await drive.files.list({
          q: "mimeType='application/vnd.google-apps.folder' and trashed=false",
          fields: '*',
          orderBy: 'modifiedByMeTime desc,name_natural',
          includeItemsFromAllDrives: true,
          supportsAllDrives: true,
        });

        return folders?.data?.files?.map((folder) => ({
          value: folder.id,
          label: folder.name,
        }));
      },
      required: {
        missingMessage: 'Folder is required',
        missingStatus: 'warning',
      },
    };
  }

  getOAuth2Client() {
    const GOOGLE_CLIENT_ID = ServerConfig.INTEGRATIONS.GOOGLE_DOCS_CLIENT_ID;
    const GOOGLE_CLIENT_SECRET =
      ServerConfig.INTEGRATIONS.GOOGLE_DOCS_CLIENT_SECRET;
    const GOOGLE_CALLBACK_URL = `${ServerConfig.SERVER_URL}/workflow-apps/oauth2callback`;

    const oAuth2Client = new google.auth.OAuth2(
      GOOGLE_CLIENT_ID,
      GOOGLE_CLIENT_SECRET,
      GOOGLE_CALLBACK_URL,
    );

    return oAuth2Client as any;
  }
}

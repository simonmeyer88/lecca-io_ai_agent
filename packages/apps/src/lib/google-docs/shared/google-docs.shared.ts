import { FieldConfig, createDynamicSelectInputField } from '@lecca-io/toolkit';
import { google } from 'googleapis';

export const shared = {
  fields: {
    dynamicSelectDocuments: createDynamicSelectInputField({
      label: 'Document',
      id: 'document',
      placeholder: 'Select document',
      description: 'The document to access',
      _getDynamicValues: async ({ connection }) => {
        const drive = await shared.googleDrive({
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
    }),
    dynamicSelectPlaceholders: {
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
          throw new Error('Document ID is required');
        } else if (typeof documentId !== 'string') {
          throw new Error('Document ID must be a string');
        }

        const docs = await shared.googleDocs({
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
    } as FieldConfig,
    dynamicSelectFolder: createDynamicSelectInputField({
      id: 'folder',
      label: 'Folder',
      description: 'Select a folder',
      placeholder: 'Select folder',
      selectOptions: [
        {
          label: 'Root',
          value: 'root',
        },
      ],
      defaultValue: 'root',
      _getDynamicValues: async ({ connection }) => {
        const drive = await shared.googleDrive({
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
    }),
  },
  googleDocs({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }) {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.INTEGRATION_GOOGLE_DOCS_CLIENT_ID,
      process.env.INTEGRATION_GOOGLE_DOCS_CLIENT_SECRET,
      `${process.env.SERVER_URL}/workflow-apps/oauth2callback`,
    );

    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    return google.docs({
      version: 'v1',
      auth: oAuth2Client,
    });
  },
  googleDrive({
    accessToken,
    refreshToken,
  }: {
    accessToken: string;
    refreshToken: string;
  }) {
    const oAuth2Client = new google.auth.OAuth2(
      process.env.INTEGRATION_GOOGLE_DOCS_CLIENT_ID,
      process.env.INTEGRATION_GOOGLE_DOCS_CLIENT_SECRET,
      `${process.env.SERVER_URL}/workflow-apps/oauth2callback`,
    );

    oAuth2Client.setCredentials({
      access_token: accessToken,
      refresh_token: refreshToken,
    });

    return google.drive({
      version: 'v3',
      auth: oAuth2Client,
    });
  },
};

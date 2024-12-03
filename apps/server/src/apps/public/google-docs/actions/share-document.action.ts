import { z } from 'zod';

import { Action, RunActionArgs } from '@/apps/lib/action';
import { InputConfig } from '@/apps/lib/input-config';
import { ServerConfig } from '@/config/server.config';

import { GoogleDocs } from '../google-docs.app';
import { GoogleDocumentShareType } from '../types/google-docs.type';

export class ShareDocument extends Action {
  app: GoogleDocs;
  id = 'google-docs_action_share-document';
  name = 'Share Document';
  description = `Share a document that ${ServerConfig.PLATFORM_NAME} has created.`;
  aiSchema = z.object({
    document: z.string().min(1).describe('The ID of the document to share'),
    role: z
      .enum(['writer', 'commenter', 'reader'])
      .describe('The role of the user'),
    email: z.string().email().min(1).describe('The email of the user'),
  });
  inputConfig: InputConfig[] = [
    {
      ...this.app.dynamicSelectDocuments(),
      label: 'Document',
      description: 'Select a document to share',
    },
    {
      id: 'role',
      label: 'Role',
      description: 'The role of the user',
      inputType: 'select',
      placeholder: 'Select a role',
      selectOptions: [
        {
          label: 'Writer',
          value: 'writer',
        },
        {
          label: 'Commenter',
          value: 'commenter',
        },
        {
          label: 'Reader',
          value: 'reader',
        },
      ],
      required: {
        missingMessage: 'Content is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'email',
      label: 'Email',
      description: 'The email address of the user',
      inputType: 'text',
      placeholder: 'Enter email',
      required: {
        missingMessage: 'Email is required',
        missingStatus: 'warning',
      },
    },
  ];

  async run({
    configValue,
    connection,
  }: RunActionArgs<ConfigValue>): Promise<GoogleDocumentShareType> {
    const googleDrive = await this.app.googleDrive({
      accessToken: connection.accessToken,
      refreshToken: connection.refreshToken,
    });

    const { document, role, email } = configValue;

    // Create new document with initial content.
    // Share the document with specified email or group.
    await googleDrive.permissions.create({
      fileId: document,
      requestBody: {
        role: role,
        type: 'user',
        emailAddress: email,
      },
    });

    return {
      documentId: document,
      role: role,
      emailAddress: email,
    };
  }

  async mockRun(): Promise<GoogleDocumentShareType> {
    return {
      documentId: 'mock-document-id',
      role: 'commenter',
      emailAddress: 'example@test.com',
    };
  }
}

type ConfigValue = z.infer<ShareDocument['aiSchema']>;

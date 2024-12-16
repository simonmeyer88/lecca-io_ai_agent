import { createApp } from '@lecca-io/toolkit';

import { appendToDocument } from './actions/append-to-document.action';
import { createDocumentFromTemplate } from './actions/create-document-from-template.action';
import { createDocument } from './actions/create-document.action';
import { editTemplate } from './actions/edit-template-document.action';
import { findDocumentByContent } from './actions/find-document-by-content.action';
import { findDocumentByTitle } from './actions/find-document-by-title.action';
import { getDocumentText } from './actions/get-document-text.action';
import { googleDocsOAuth2 } from './connections/google-docs.oauth2';
import { newDocumentInFolder } from './triggers/new-document-in-folder.trigger';
import { newDocument } from './triggers/new-document.trigger';

export const googleDocs = createApp({
  id: 'google-docs',
  name: 'Google Docs',
  description:
    'Use Google Docs to create, and collaborate on online documents.',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/google-docs.svg',
  actions: [
    createDocumentFromTemplate,
    createDocument,
    editTemplate,
    appendToDocument,
    findDocumentByTitle,
    findDocumentByContent,
    getDocumentText,
    // shareDocument, //Need scope auth/drive to do this.
    // deleteDocument, //Need scope auth/drive to do this.
  ],
  triggers: [newDocumentInFolder, newDocument],
  connections: [googleDocsOAuth2],
});

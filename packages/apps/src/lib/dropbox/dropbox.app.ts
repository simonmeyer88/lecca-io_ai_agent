import { createApp } from '@lecca-io/toolkit';

import { dropboxCreateFolder } from './actions/create-folder.action';
import { getTemporaryLink } from './actions/get-temporary-link.action';
import { listFolderContents } from './actions/list-folder-contents.action';
import { listFolders } from './actions/list-folders.action';
import { dropboxSearch } from './actions/search.action';
import { dropboxOAuth2 } from './connections/dropbox.oauth2';

export const dropbox = createApp({
  id: 'dropbox',
  name: 'Dropbox',
  description:
    'Dropbox is a cloud-based file storage service that allows users to save files online and sync them across devices.',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/dropbox.svg',
  actions: [
    dropboxSearch,
    listFolderContents,
    getTemporaryLink,
    dropboxCreateFolder,
    listFolders,
  ],
  triggers: [],
  connections: [dropboxOAuth2],
});

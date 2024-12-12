import { createApp } from '@lecca-io/toolkit';

import { createContact } from './actions/create-contact.action';
import { getContact } from './actions/get-contact-by-resource-name.action';
import { listContacts } from './actions/list-contacts.action';
import { googleContactsOAuth2 } from './connections/google-contacts.oauth2';

export const googleContacts = createApp({
  id: 'google-contacts',
  name: 'Google Contacts',
  description:
    'Google Contacts allows users to store and manage their contacts across multiple devices',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/google-contacts.svg',
  actions: [createContact, listContacts, getContact],
  triggers: [],
  connections: [googleContactsOAuth2],
  needsConnection: true,
});

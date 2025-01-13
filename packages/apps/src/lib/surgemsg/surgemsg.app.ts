import { createApp } from '@lecca-io/toolkit';

import { createContact } from './actions/create-contact.action';
import { retrieveContact } from './actions/retrieve-contact.action';
import { sendMessage } from './actions/send-message.action';
import { updateContact } from './actions/update-contact.action';
import { surgemsgApiKey } from './connections/surgemsg.api-key';

export const surgemsg = createApp({
  id: 'surgemsg',
  name: 'Surge',
  description: 'The easiest way to send texts from your application.',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/surgemsg.png',
  actions: [sendMessage, createContact, updateContact, retrieveContact],
  triggers: [],
  connections: [surgemsgApiKey],
});

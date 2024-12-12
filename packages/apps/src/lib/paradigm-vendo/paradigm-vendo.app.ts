import { createApp } from '@lecca-io/toolkit';

import { getAppointment } from './actions/get-appointment.action';
import { paradigmVendoKeyPair } from './connections/paradigm-vendo.key-pair';

export const paradigmVendo = createApp({
  id: 'paradigm-vendo',
  name: 'Paradigm Vendo',
  description:
    'A digital selling solution that lets contractors and in-home sales professionals streamline selling.',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/paradigm-vendo.webp',
  actions: [getAppointment],
  triggers: [],
  connections: [paradigmVendoKeyPair],
  needsConnection: true,
});

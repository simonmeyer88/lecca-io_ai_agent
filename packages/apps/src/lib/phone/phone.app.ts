import { createApp } from '@lecca-io/toolkit';

import { makePhoneCall } from './actions/make-phone-call.action';

export const phone = createApp({
  id: 'phone',
  name: 'Phone',
  description: `Make phone calls using ${process.env.PLATFORM_NAME} credits`,
  logoUrl: 'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/phone.svg',
  actions: [makePhoneCall],
  triggers: [],
  connections: [],
});

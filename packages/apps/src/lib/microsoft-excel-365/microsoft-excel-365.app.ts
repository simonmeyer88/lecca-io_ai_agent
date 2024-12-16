import { createApp } from '@lecca-io/toolkit';

import { getWorksheets } from './actions/get-worksheets.action';
import { microsoftExcel365OAuth2 } from './connections/microsoft-excel-365.oauth2';

export const microsoftExcel365 = createApp({
  id: 'microsoft-excel-365',
  name: 'Microsoft Excel 365',
  description:
    'Microsoft Excel is the industry leading spreadsheet software program, a powerful data visualization and analysis tool.',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/microsoft-excel-365.svg',
  actions: [getWorksheets],
  triggers: [],
  connections: [microsoftExcel365OAuth2],
});

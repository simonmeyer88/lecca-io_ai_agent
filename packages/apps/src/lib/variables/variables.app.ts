import { createApp } from '@lecca-io/toolkit';

import { getVariable } from './actions/get-variable.action';
import { listVariables } from './actions/list-variables.action';
import { updateVariable } from './actions/update-variable.action';

export const variables = createApp({
  id: 'variables',
  name: 'Variables',
  description: 'Leverage variables to reuse data across your workflows.',
  logoUrl:
    'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/variables.svg',
  actions: [updateVariable, listVariables, getVariable],
  triggers: [],
  connections: [],
});

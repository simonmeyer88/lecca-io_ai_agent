import { createApp } from '@lecca-io/toolkit';

import { addition } from './actions/addition.action';
import { division } from './actions/division.action';
import { mathExpression } from './actions/math.action';
import { multiplication } from './actions/multiplication.action';
import { subtraction } from './actions/subtraction.action';

export const math = createApp({
  id: 'math',
  name: 'Math',
  description: `Math tools to do math operations`,
  logoUrl: 'https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/math.svg',
  actions: [mathExpression, addition, subtraction, division, multiplication],
  triggers: [],
  connections: [],
});

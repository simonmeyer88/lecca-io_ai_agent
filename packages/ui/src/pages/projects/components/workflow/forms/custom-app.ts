import { WorkflowApp } from '../../../../../models/workflow/workflow-app-model';

import { CUSTOM_ACTIONS } from './custom-action';
import { CUSTOM_TRIGGERS } from './custom-triggers';

export const CUSTOM_APP: WorkflowApp = {
  id: '550e8400-e29b-41d4-a716-e849ro540000',
  name: 'Lecca.io',
  logoUrl: `${import.meta.env.VITE_CLIENT_URL}/workflow-app-logos/workflow.svg`,
  description: 'App provided by Lecca.io with actions and triggers.',
  actions: CUSTOM_ACTIONS,
  triggers: CUSTOM_TRIGGERS,
  connections: [],
  isPublished: false,
  availableForAgent: true,
  needsConnection: true,
} as const;

import { WorkflowApp } from '@/models/workflow/workflow-app-model';

export const CUSTOM_ACTIONS: WorkflowApp['actions'] = [
  {
    id: '909e8400-e29b-41d4-a716-e849ro540001',
    name: 'HTTP Request',
    description: 'Custom action provided by Lecca.io',
    needsConnection: false,
    inputConfig: [
      {
        id: 'name',
        description: 'Name of the action',
        required: {
          missingMessage: 'Name is required',
          missingStatus: 'warning',
        },
        label: 'Name',
        defaultValue: 'some default value',
        placeholder: 'Enter the name of the action',
        occurenceType: 'single',
        inputType: 'text',
      },
    ],
  },
  {
    id: '909e8400-890e-41d4-a716-e849ro540001',
    name: 'Parse JSON',
    needsConnection: false,
    description: 'Custom action provided by Lecca.io',
    inputConfig: [],
  },
] as const;

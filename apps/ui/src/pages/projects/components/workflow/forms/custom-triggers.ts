import { WorkflowApp } from '@/models/workflow/workflow-app-model';

export const CUSTOM_TRIGGERS: WorkflowApp['triggers'] = [
  {
    //id is uuid
    id: '550e8400-e29b-41d4-a716-44iuro540000',
    name: 'Run manually',
    description: 'Start your workflow manually',
    inputConfig: [],
    needsConnection: false,
  },
  {
    //id is uuid
    id: '550roe40-e29b-41d4-a716-44iuro540000',
    name: 'Recurring schedule',
    description: 'Run your workflow on a schedule',
    needsConnection: false,
    inputConfig: [
      {
        id: 'initial-start',
        label: 'Initial start',
        inputType: 'date',
        description: 'Date and time to start the schedule',
        switchOptions: {
          checked: 'Immediately',
          unchecked: 'Later',
          defaultChecked: true,
        },
        required: {
          missingMessage: 'Initial start is required',
          missingStatus: 'warning',
        },
      },
    ],
  },
  {
    //id is uuid
    id: '550e8400-pi48-41d4-a716-44iuro540000',
    name: 'Incoming Webhook',
    description: 'Trigger your workflow via a webhook',
    inputConfig: [],
    needsConnection: false,
  },
  {
    //id is uuid
    id: '990e8400-pi48-41d4-a716-44iuro540000',
    name: 'Random',
    description: 'Testing random inputs',
    needsConnection: false,
    inputConfig: [
      {
        id: 'random',
        label: 'Random',
        description: 'Random input',
        inputType: 'multi-select',
        placeholder: 'Select an option',
        selectOptions: [
          { label: 'Option 1', value: 'option-1' },
          { label: 'Option 2', value: 'option-2' },
          { label: 'Option 3', value: 'option-3' },
          {
            label: 'Option 4',
            value: 'option-4',
          },
          {
            label: 'Option 5',
            value: 'option-5',
          },
          {
            label: 'Option 6',
            value: 'option-6',
          },
          {
            label: 'Option 7',
            value: 'option-7',
          },
          {
            label: 'Option 8',
            value: 'option-8',
          },
          {
            label: 'Option 9',
            value: 'option-9',
          },
          {
            label: 'Option 10',
            value: 'option-10',
          },
        ],
        required: {
          missingMessage: 'Random input',
          missingStatus: 'warning',
        },
      },
    ],
  },
] as const;

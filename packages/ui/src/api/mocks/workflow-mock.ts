import { Workflow } from '../../models/workflow/workflow-model';

export const WORKFLOW_MOCK: Workflow = {
  id: '8736629e-f598-4fe3-a3a8-2cdac1615de5',
  description: 'This is a workflow',
  createdAt: new Date(),
  updatedAt: new Date(),
  isActive: true,
  name: 'Fall Campaign',
  workflowOrientation: 'HORIZONTAL',
  nodes: [
    {
      id: 'f349efb4-9fbe-45f0-857a-45a883343393',
      connectionId: 'b7160f73-fd35-4194-a9cc-11112ec2a53d',
      appId: '550e8400-e29b-41d4-a716-e849ro540000',
      nodeType: 'trigger',
      triggerId: '550roe40-e29b-41d4-a716-44iuro540000',
      description: 'Run your workflow on a schedule',
      name: 'Recurring schedule',
      position: {
        x: 0,
        y: 0,
      },
      value: {
        connection: 'b7160f73-fd35-4194-a9cc-e0f02ec2a53d',
      },
      raw: {
        connection: 'b7160f73-fd35-4194-a9cc-e0f02ec2a53d',
      },
    },
    {
      connectionId: 'b7160f73-fd35-4194-a9cc-11112ec2a53d',
      id: 'bd30785d-ee70-410f-830f-7ccd6d2c9f0d',
      appId: '550e8400-e29b-41d4-a716-e849ro540000',
      nodeType: 'action',
      actionId: '909e8400-e29b-41d4-a716-e849ro540001',
      description: 'Custom action provided by Lecca.io',
      name: 'HTTP Request',
      position: {
        x: 200,
        y: 0,
      },
    },
    {
      connectionId: 'b7160f73-fd35-4194-a9cc-11112ec2a53d',
      id: '6297f392-9019-4cff-84e5-51ca58142cef',
      appId: '333e8400-e29b-41d4-a716-446655440000',
      nodeType: 'action',
      actionId: '880e8400-e29b-41d4-a716-446655443847',
      description: 'Send an email',
      name: 'Send Email',
      position: {
        x: 400,
        y: -125,
      },
      value: {
        to: 'test',
        subject: 'test',
        message: 'test',
      },
      raw: {
        to: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'test',
                },
              ],
            },
          ],
        },
        subject: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'test',
                },
              ],
            },
          ],
        },
        message: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'test',
                },
              ],
            },
          ],
        },
      },
    },
    {
      connectionId: 'b7160f73-fd35-4194-a9cc-11112ec2a53d',
      id: '668e40e4-49fd-4213-ae01-ed1fe0f6d76e',
      appId: '550e8400-e29b-41d4-a716-446655440000',
      nodeType: 'action',
      actionId: '07202f66-f4a1-4a34-89b8-d7095fb0449c',
      description: 'Generates audio from the input text',
      name: 'Generate Speech',
      position: {
        x: 400,
        y: 25,
      },
      value: {
        model: 'tts-1-hd',
        voice: 'alloy',
        input: 'test',
        response_format: 'opus',
      },
      raw: {
        model: 'tts-1-hd',
        voice: 'alloy',
        input: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'test',
                },
              ],
            },
          ],
        },
        response_format: 'opus',
      },
    },
    {
      connectionId: 'b7160f73-fd35-4194-a9cc-11112ec2a53d',
      id: 'c928a57d-d562-4440-8ac7-eb74fdf411ee',
      appId: '335e8400-e29b-41d4-a716-446655440000',
      nodeType: 'action',
      actionId: '880eeee8-e29b-41d4-a716-446655440000',
      description: 'Create a row in a Google Sheet',
      name: 'Create Row',
      position: {
        x: 400,
        y: 125,
      },
      value: {
        sheet_id: 'test',
        data: 'test',
      },
      raw: {
        sheet_id: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'test',
                },
              ],
            },
          ],
        },
        data: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'test',
                },
              ],
            },
          ],
        },
      },
    },
    {
      connectionId: 'b7160f73-fd35-4194-a9cc-11112ec2a53d',
      id: 'd1850181-8927-4248-a259-d744e0e4bad2',
      appId: '335e8400-e29b-41d4-a716-446655440000',
      nodeType: 'action',
      actionId: '880eeee8-e29b-41d4-a716-446655440000',
      description: 'Create a row in a Google Sheet',
      name: 'Create Row',
      position: {
        x: 600,
        y: -175,
      },
      value: {
        sheet_id: 'test',
        data: 'test',
        connection: '3db31516-1167-4eda-a495-ad70d0b0d086',
      },
      raw: {
        sheet_id: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'test',
                },
              ],
            },
          ],
        },
        data: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'test',
                },
              ],
            },
          ],
        },
        connection: '3db31516-1167-4eda-a495-ad70d0b0d086',
      },
    },
    {
      id: '9c228e75-3c44-4436-9938-89186277c6b7',
      nodeType: 'placeholder',
      position: {
        x: 600,
        y: -75,
      },
    },
    {
      connectionId: 'b7160f73-fd35-4194-a9cc-11112ec2a53d',
      id: '2ff271b4-3c3b-4649-bda1-924800186ef7',
      appId: '550e8400-e29b-41d4-a716-446655440000',
      nodeType: 'action',
      actionId: '07202f66-f4a1-4a34-89b8-d7095fb0449c',
      description: 'Generates audio from the input text',
      name: 'Generate Speech',
      position: {
        x: 600,
        y: 25,
      },
      value: {
        model: 'tts-1',
        voice: 'echo',
        input: 'test',
        response_format: 'opus',
        connection: '3db31516-1167-4eda-a495-ad70d0b0d086',
      },
      raw: {
        model: 'tts-1',
        voice: 'echo',
        input: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'test',
                },
              ],
            },
          ],
        },
        response_format: 'opus',
        connection: '3db31516-1167-4eda-a495-ad70d0b0d086',
      },
    },
    {
      connectionId: 'b7160f73-fd35-4194-a9cc-11112ec2a53d',
      id: 'd6b9160a-a12b-4623-adff-626506420d99',
      appId: '335e8400-e29b-41d4-a716-446655440000',
      nodeType: 'action',
      actionId: '880eeee8-e29b-41d4-a716-446655440000',
      description: 'Create a row in a Google Sheet',
      name: 'Create Row',
      position: {
        x: 600,
        y: 125,
      },
      value: {
        sheet_id: 'test',
        data: 'test',
        connection: '3db31516-1167-4eda-a495-ad70d0b0d086',
      },
      raw: {
        sheet_id: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'test',
                },
              ],
            },
          ],
        },
        data: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'test',
                },
              ],
            },
          ],
        },
        connection: '3db31516-1167-4eda-a495-ad70d0b0d086',
      },
    },
    {
      connectionId: 'b7160f73-fd35-4194-a9cc-11112ec2a53d',
      id: '7dd1e626-1a83-43b5-8a24-7b39ab2e9a8c',
      appId: '550e8400-e29b-41d4-a716-e849ro540000',
      nodeType: 'action',
      actionId: '909e8400-890e-41d4-a716-e849ro540001',
      description: 'Custom action provided by Lecca.io',
      name: 'Parse JSON',
      position: {
        x: 800,
        y: -175,
      },
    },
    {
      connectionId: 'b7160f73-fd35-4194-a9cc-11112ec2a53d',
      id: 'd759f086-0682-496e-a58b-3cd0ef373f47',
      appId: '333e8400-e29b-41d4-a716-446655440000',
      nodeType: 'action',
      actionId: '880e8400-e29b-41d4-a716-446655443847',
      description: 'Send an email',
      name: 'Send Email',
      position: {
        x: 800,
        y: 25,
      },
    },
    {
      connectionId: 'b7160f73-fd35-4194-a9cc-11112ec2a53d',
      id: 'a0abbd66-cdf7-48ab-846f-e496b2e7a231',
      appId: '336e8400-e29b-41d4-a716-446655440000',
      nodeType: 'action',
      actionId: '880e8400-e29b-98ee-a716-446655440000',
      description: 'Create a contact in HubSpot',
      name: 'Create Contact',
      position: {
        x: 800,
        y: 125,
      },
      value: {
        first_name: 'test',
        last_name: 'test',
        email: 'test',
        connection: 'c9c30802-d8f7-4915-9603-01c751237887',
      },
      raw: {
        first_name: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'test',
                },
              ],
            },
          ],
        },
        last_name: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'test',
                },
              ],
            },
          ],
        },
        email: {
          type: 'doc',
          content: [
            {
              type: 'paragraph',
              content: [
                {
                  type: 'text',
                  text: 'test',
                },
              ],
            },
          ],
        },
        connection: 'c9c30802-d8f7-4915-9603-01c751237887',
      },
    },
    {
      id: 'd0adf535-6afc-4fb6-a0c7-aded4cba4cc1',
      nodeType: 'placeholder',
      position: {
        x: 1000,
        y: -175,
      },
    },
    {
      id: '434455e8-1147-45c9-b6a4-8e16fa62ec5a',
      nodeType: 'placeholder',
      position: {
        x: 1000,
        y: 25,
      },
    },
    {
      id: '10bd5db0-1faf-4734-bd12-12b3b75ad6d2',
      nodeType: 'placeholder',
      position: {
        x: 1000,
        y: 125,
      },
    },
  ],
  edges: [
    {
      id: '9005b14f-4043-4ae3-b709-3761870c54da',
      source: 'f349efb4-9fbe-45f0-857a-45a883343393',
      target: 'bd30785d-ee70-410f-830f-7ccd6d2c9f0d',
      type: 'workflow',
    },
    {
      id: 'cc38e535-ce9a-45a2-803d-774a7e4c2d9f',
      source: 'bd30785d-ee70-410f-830f-7ccd6d2c9f0d',
      target: '6297f392-9019-4cff-84e5-51ca58142cef',
      type: 'workflow',
    },
    {
      id: '62f84238-68d1-4f4f-99af-09e3874376b8',
      source: '6297f392-9019-4cff-84e5-51ca58142cef',
      target: 'd1850181-8927-4248-a259-d744e0e4bad2',
      type: 'workflow',
    },
    {
      id: '70cbc6dc-fcec-4cb4-b71d-8d90a33b2bfa',
      source: 'd1850181-8927-4248-a259-d744e0e4bad2',
      target: '7dd1e626-1a83-43b5-8a24-7b39ab2e9a8c',
      type: 'workflow',
    },
    {
      id: '418a9dc7-4cea-4639-8bd0-bdfc21a46e16',
      source: 'bd30785d-ee70-410f-830f-7ccd6d2c9f0d',
      target: '668e40e4-49fd-4213-ae01-ed1fe0f6d76e',
      type: 'workflow',
    },
    {
      id: 'f54e66a3-afee-4a0d-ac30-fc1b41aef483',
      source: 'bd30785d-ee70-410f-830f-7ccd6d2c9f0d',
      target: 'c928a57d-d562-4440-8ac7-eb74fdf411ee',
      type: 'workflow',
    },
    {
      id: '5455b245-eb6c-4e1b-aa8d-abb179e950dc',
      source: '668e40e4-49fd-4213-ae01-ed1fe0f6d76e',
      target: '2ff271b4-3c3b-4649-bda1-924800186ef7',
      type: 'workflow',
    },
    {
      id: '4be9ac2f-def6-4633-b5bc-db4a65e4dec1',
      source: 'c928a57d-d562-4440-8ac7-eb74fdf411ee',
      target: 'd6b9160a-a12b-4623-adff-626506420d99',
      type: 'workflow',
    },
    {
      id: 'c092e72a-effc-48fc-b0f2-2900e427fc26',
      source: '2ff271b4-3c3b-4649-bda1-924800186ef7',
      target: 'd759f086-0682-496e-a58b-3cd0ef373f47',
      type: 'workflow',
    },
    {
      id: '954a905d-92bd-4f54-8477-4a075e735557',
      source: 'd6b9160a-a12b-4623-adff-626506420d99',
      target: 'a0abbd66-cdf7-48ab-846f-e496b2e7a231',
      type: 'workflow',
    },
    {
      id: '0df1975a-5a71-419a-b7c5-bed4b2b7a956',
      source: 'a0abbd66-cdf7-48ab-846f-e496b2e7a231',
      target: '10bd5db0-1faf-4734-bd12-12b3b75ad6d2',
      type: 'placeholder',
    },
    {
      id: 'd759f086-0682-496e-a58b-3cd0ef373f47=>434455e8-1147-45c9-b6a4-8e16fa62ec5a',
      source: 'd759f086-0682-496e-a58b-3cd0ef373f47',
      target: '434455e8-1147-45c9-b6a4-8e16fa62ec5a',
      type: 'placeholder',
    },
    {
      id: '7dd1e626-1a83-43b5-8a24-7b39ab2e9a8c=>d0adf535-6afc-4fb6-a0c7-aded4cba4cc1',
      source: '7dd1e626-1a83-43b5-8a24-7b39ab2e9a8c',
      target: 'd0adf535-6afc-4fb6-a0c7-aded4cba4cc1',
      type: 'placeholder',
    },
    {
      id: '99c7ebba-1084-4ed9-94cb-e4c87d506d5c',
      source: '6297f392-9019-4cff-84e5-51ca58142cef',
      target: '9c228e75-3c44-4436-9938-89186277c6b7',
      type: 'placeholder',
    },
  ],
  project: {
    id: 'b7160f73-fd35-4194-a9cc-e0f02ec2a53d',
    name: 'Test Project',
  },
};

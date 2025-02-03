import {
  createAction,
  createSelectInputField,
  createTextInputField,
} from '@lecca-io/toolkit';
import { z } from 'zod';

export const createKnowledge = createAction({
  id: 'knowledge_action_create-knowledge',
  name: 'Create Knowledge Notebook',
  description: 'Creates a new knowledge notebook',
  iconUrl: `https://lecca-io.s3.us-east-2.amazonaws.com/assets/actions/knowledge_action_search-knowledge.svg`,
  inputConfig: [
    createTextInputField({
      id: 'name',
      label: 'Name',
      description: 'The name of the new notebook',
      placeholder: 'Add a name',
      required: {
        missingMessage: 'Name is required',
        missingStatus: 'warning',
      },
    }),
    createTextInputField({
      id: 'description',
      label: 'Description',
      description: 'The description of the new notebook',
      placeholder: 'Add optional description',
    }),
    createSelectInputField({
      id: 'saveToOption',
      label: 'Save to?',
      description:
        'Select whether to save the notebook to the workspace or project',
      hideCustomTab: true,
      selectOptions: [
        {
          label: 'Save to Project',
          value: 'project',
        },
        {
          label: 'Save to Workspace',
          value: 'workspace',
        },
      ],
      required: {
        missingMessage: 'Must select where to save',
        missingStatus: 'warning',
      },
    }),
  ],

  aiSchema: z.object({
    name: z.string().describe('The name of the new notebook'),
    description: z
      .string()
      .nullable()
      .optional()
      .describe('Description of the new notebook'),
    saveToOption: z
      .enum(['project', 'workspace'])
      .describe(
        'Select whether to save the notebook to the workspace or project',
      ),
  }),

  run: async ({ configValue, projectId, workspaceId, knowledge }) => {
    const newNotebook = await knowledge.create({
      data: {
        name: configValue.name,
        description: configValue.description,
        projectId:
          configValue.saveToOption === 'project' ? projectId : undefined,
      },
      workspaceId,
      expansion: {
        project: true,
        description: true,
      },
    });

    return {
      notebook: newNotebook,
    };
  },

  mockRun: async () => {
    return {
      notebook: {
        id: '123',
        name: 'New Notebook',
        description: 'New Notebook Description',
      },
    };
  },
});

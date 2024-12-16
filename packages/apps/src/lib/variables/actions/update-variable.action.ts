import {
  createAction,
  createJsonInputField,
  parseDateToISO,
} from '@lecca-io/toolkit';
import { z } from 'zod';

import { shared } from '../shared/variables.shared';

export const updateVariable = createAction({
  id: 'variables_action_update-variables',
  name: 'Update Variable',
  description: "Updates a variable's value",
  iconUrl: `https://lecca-io.s3.us-east-2.amazonaws.com/assets/apps/variables.svg`,
  inputConfig: [
    shared.fields.dynamicGetVariable,
    createJsonInputField({
      id: 'value',
      label: 'New Value',
      description:
        "New value for the variable. Must match the variable's data type.",
      placeholder: 'Add new value',
      required: {
        missingStatus: 'warning',
        missingMessage: 'Please provide a new value',
      },
    }),
  ],

  aiSchema: z.object({
    variableId: z
      .string()
      .nullable()
      .optional()
      .describe('Variable ID. If you do not have the ID, please ask for it.'),
    value: z
      .any()
      .nullable()
      .optional()
      .describe(
        "New value for the variable. Must be string, number, boolean, or ISO date. If you don't know what type the variable is, please ask.",
      ),
  }),

  run: async ({ configValue, projectId, workspaceId, prisma }) => {
    if (!configValue.variableId) {
      throw new Error('Variable ID is required');
    }

    const variable = await prisma.variable.findFirst({
      where: {
        AND: [
          { id: configValue.variableId },
          {
            OR: [
              {
                FK_projectId: projectId,
              },
              {
                AND: [
                  {
                    FK_workspaceId: workspaceId,
                  },
                  {
                    FK_projectId: null,
                  },
                ],
              },
            ],
          },
        ],
      },
      select: {
        dataType: true,
      },
    });

    if (!variable) {
      throw new Error('Variable not found');
    }

    let value = configValue.value;

    switch (variable.dataType) {
      case 'boolean':
        if (typeof value !== 'boolean' && value != 'true' && value != 'false') {
          throw new Error('Value must be true or false (boolean)');
        }
        value = value === 'true' ? true : false;
        break;
      case 'number':
        if (typeof value !== 'number' && isNaN(value)) {
          throw new Error('Value must be a number');
        }
        value = Number(value);
        break;
      case 'string':
        if (typeof value !== 'string') {
          throw new Error('Value must be a string');
        }
        break;
      case 'date':
        value = parseDateToISO(value);
        break;
      case 'json':
        try {
          value = JSON.parse(value);
        } catch {
          throw new Error('Value must be a valid JSON');
        }
    }

    const updatedVariable = await prisma.variable.update({
      where: {
        id: configValue.variableId,
      },
      data: {
        value,
      },
      select: {
        id: true,
        name: true,
        description: true,
        value: true,
      },
    });

    return {
      variable: updatedVariable,
    };
  },

  mockRun: async () => {
    return {
      variable: {
        id: '1',
        name: 'Variable 1',
        description: 'This is a variable',
        value: 'This can be text, number, boolean, or data',
      },
    };
  },
});

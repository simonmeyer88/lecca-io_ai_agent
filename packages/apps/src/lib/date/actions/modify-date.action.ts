import { createAction, parseDateToISO } from '@lecca-io/toolkit';
import { DateTime } from 'luxon';
import { z } from 'zod';

export const modifyDate = createAction({
  id: 'date_action_modify-date',
  name: 'Add/Subtract Time',
  description: 'Adds or subtracts time from the selected date.',
  viewOptions: {
    saveButtonOptions: {
      replaceSaveAndTestButton: {
        label: 'Save & Test',
        type: 'real',
      },
    },
  },
  inputConfig: [
    {
      id: 'date',
      label: 'Date',
      description: 'Event start time in ISO String format with timezone or UTC',
      inputType: 'date-time',
      required: {
        missingMessage: 'Start DateTime is required',
        missingStatus: 'warning',
      },
    },
    {
      id: 'modifiers',
      label: 'Add/Subtract',
      description: 'Add or subtract time from the selected date',
      occurenceType: 'multiple',
      required: {
        missingMessage: 'At least one modifier is required',
        missingStatus: 'warning',
      },
      inputConfig: [
        {
          id: 'modifier',
          label: 'Modifier',
          inputType: 'select',
          description: '',
          selectOptions: [
            { label: 'Seconds', value: 'seconds' },
            { label: 'Minutes', value: 'minutes' },
            { label: 'Hours', value: 'hours' },
            { label: 'Days', value: 'days' },
            { label: 'Weeks', value: 'weeks' },
            { label: 'Months', value: 'months' },
            { label: 'Years', value: 'years' },
          ],
          required: {
            missingMessage: 'Modifier is required',
            missingStatus: 'warning',
          },
        },
        {
          id: 'value',
          label: 'Value',
          inputType: 'number',
          description: 'Value to add or subtract',
          numberOptions: {
            step: 1,
          },
          required: {
            missingMessage: 'Value is required',
            missingStatus: 'warning',
          },
        },
      ],
    },
  ],
  aiSchema: z.object({
    date: z
      .string()
      .min(1)
      .describe('Time in ISO String format with timezone or UTC'),
    modifiers: z.array(
      z.object({
        modifier: z.enum([
          'seconds',
          'minutes',
          'hours',
          'days',
          'weeks',
          'months',
          'years',
        ]),
        value: z.number().int().describe('Value to add or subtract'),
      }),
    ),
  }),
  run: async ({ configValue }) => {
    const { date, modifiers } = configValue;
    const isoDate = parseDateToISO(date);
    let modifiedDate = DateTime.fromISO(isoDate);

    for (const modifier of modifiers) {
      const { modifier: mod, value } = modifier;
      switch (mod) {
        case 'seconds':
          modifiedDate = modifiedDate.plus({ seconds: value });
          break;
        case 'minutes':
          modifiedDate = modifiedDate.plus({ minutes: value });
          break;
        case 'hours':
          modifiedDate = modifiedDate.plus({ hours: value });
          break;
        case 'days':
          modifiedDate = modifiedDate.plus({ days: value });
          break;
        case 'weeks':
          modifiedDate = modifiedDate.plus({ weeks: value });
          break;
        case 'months':
          modifiedDate = modifiedDate.plus({ months: value });
          break;
        case 'years':
          modifiedDate = modifiedDate.plus({ years: value });
          break;
      }
    }

    return { date: modifiedDate.toISO() };
  },
  mockRun: async () => {
    return [];
  },
});

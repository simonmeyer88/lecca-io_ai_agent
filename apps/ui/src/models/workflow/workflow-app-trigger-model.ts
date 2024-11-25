import { z } from 'zod';

import { inputConfigSchema } from './input-config-model';

export const viewOptionsSchema = z.object({
  hideConditions: z.boolean().optional(),
  showWebhookListenerButton: z.boolean().optional(),
  showManualInputButton: z.boolean().optional(),
  manualInputButtonOptions: z.object({
    label: z.string(),
    tooltip: z.string(),
  }),
  saveButtonOptions: z
    .object({
      hideSaveAndTestButton: z.boolean().optional(),
      hideSaveButton: z.boolean().optional(),
      replaceSaveAndTestButton: z
        .object({
          type: z.enum(['real', 'mock']),
          label: z.string(),
          tooltip: z.string().optional(),
        })
        .optional(),
      replaceSaveButton: z
        .object({
          type: z.enum(['real', 'mock', 'save']),
          label: z.string(),
          tooltip: z.string().optional(),
        })
        .optional(),
    })
    .optional(),
});

export const workflowAppTriggerSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
  description: z.string(),
  inputConfig: inputConfigSchema,
  iconUrl: z.string().min(1).optional(),
  group: z
    .object({
      label: z.string(),
      value: z.string(),
    })
    .nullable()
    .optional(),
  needsConnection: z.boolean(),
  viewOptions: viewOptionsSchema.optional(),
  icon: z.string().optional().nullable(),
  availableForAgent: z.boolean().optional(),
  strategy: z
    .enum([
      'webhook.app',
      'manual',
      'poll.dedupe-time-based',
      'poll.dedupe-item-based',
      'poll.dedupe-length-based',
      'webhook.custom',
      'schedule',
    ])
    .optional(),
});
export type WorkflowAppTriggerType = z.infer<typeof workflowAppTriggerSchema>;
